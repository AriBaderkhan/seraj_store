import pool from '../db_connection.js'

async function findItem(query) {
    if (!query) return [];

    // --- STRATEGY 1: DEVICE (IMEI) SEARCH ---
    // Rule: Numbers only, length > 8 (to avoid scanning short IDs)
    const isScanningDevice = /^\d+$/.test(query) && query.length > 8;

    if (isScanningDevice) {
        // Query A: Fetch Single Physical Device (1 Row)
        const deviceQuery = `
            SELECT 
                i.id,
                i.name, 
                i.image_path, 
                i.storage, 
                i.color, 
                i.sim_type,
                -- Return '1' stock because this is a specific physical unit
                1 as stock_qty,
                ii.imei1,
                ii.imei2,
                ii.purchase_price,
                ii.selling_price,
                ii.warranty_month,
                ii.phone_detail,
                'phone' as item_type
            FROM item_imeis ii
            JOIN items i ON ii.item_id = i.id
            WHERE (ii.imei1 = $1 OR ii.imei2 = $1)
            AND ii.status = 'in_stock'
            LIMIT 1;
        `;
        const deviceResult = await pool.query(deviceQuery, [query]);

        // If found, return immediately without running the Product Search
        if (deviceResult.rows.length > 0) {
            return deviceResult.rows;
        }
    }

    // --- STRATEGY 2: PRODUCT SEARCH ---
    // Fallback if not a device scan (or device not found)
    const productQuery = `
        SELECT 
            i.id,
            i.name,
            i.image_path,
            i.storage,
            i.color,
            i.sim_type,
            i.serial_no,
            
            -- STOCK CALCULATION:
            -- Count IMEIs for phones, use static quantity for accessories
            CASE 
                WHEN COUNT(ii.id) > 0 THEN CAST(COUNT(ii.id) AS INTEGER)
                ELSE i.stock_qty 
            END as stock_qty,

            -- PRICING STRATEGY:
            -- Get latest Unit Sell Price from purchase history
            (
                SELECT pi.unit_sell_price 
                FROM purchase_items pi 
                WHERE pi.item_id = i.id 
                ORDER BY pi.created_at DESC 
                LIMIT 1
            ) as selling_price,

            'product' as item_type

        FROM items i
        LEFT JOIN item_imeis ii ON i.id = ii.item_id AND ii.status = 'in_stock'
        

        WHERE i.name ILIKE $1 
           OR i.serial_no ILIKE $1
           OR (CAST(i.id AS TEXT) = $2)
        
        GROUP BY i.id
    `;


    // Prepare query params: $1 for LIKE, $2 for exact ID match (if numeric)
    const isNumeric = /^\d+$/.test(query);
    const searchParams = [`%${query}%`, isNumeric ? query : null];

    const productResult = await pool.query(productQuery, searchParams);
    return productResult.rows;
}

async function saleCreate(data, client = pool) {
    const result = await client.query(
        `INSERT INTO sales (customer_name, total_amount, total_paid, payment_method, sold_by)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [data.customer_name, data.total_amount, data.total_paid, data.payment_method, data.sold_by]
    );
    return result.rows[0];
}

async function saleItemCreate(data, client = pool) {
    const priceResult = await pool.query(
        `SELECT price FROM  (
        SELECT selling_price AS price FROM item_imeis WHERE imei1 = $1 OR imei2 = $1
        UNION ALL 
        SELECT unit_sell_price AS price FROM purchase_items WHERE item_id = $2 ) t
        LIMIT 1`,
        [data.imei, data.item_id]
    );

    const unit_price = priceResult.rows.length > 0 ? priceResult.rows[0].price : null;
    const result = await client.query(
        `INSERT INTO sale_items (sale_id, item_id, quantity, unit_price, imei, warranty_start_date, warranty_end_date)
        VALUES ($1, $2, $3,$4, $5, $6, $7)
        RETURNING *`,
        [data.sale_id, data.item_id, data.qty, unit_price, data.imei, data.warranty_start_date, data.warranty_end_date]
    );
    // Note: The SQL above tries to fetch price dynamically. To match user's logic better, we should probably trust the service to pass price or fetch it there.
    // Let's simplify to standard insert assuming service passes data.
    return result.rows[0];
}

async function findAllSales(search) {
    let query = `SELECT * FROM sales `

    const values = [];
    if (search) {
        values.push(`%${search}%`);
        query += ` WHERE customer_name ILIKE $${values.length}`;
    }

    query += ` ORDER BY created_at DESC`
    const { rows } = await pool.query(query, values)
    return rows;
}
async function findSale(sale_id) {
    // 1. Fetch Sale Header
    const saleQuery = `SELECT * FROM sales WHERE id = $1`;
    const saleResult = await pool.query(saleQuery, [sale_id]);

    if (saleResult.rows.length === 0) return null;
    const saleData = saleResult.rows[0];

    // 2. Fetch Items
    const itemsQuery = `
        SELECT si.*, i.name as item_name, i.details
        FROM sale_items si
        JOIN items i ON si.item_id = i.id
        WHERE si.sale_id = $1
    `;
    const itemsResult = await pool.query(itemsQuery, [sale_id]);

    // 3. Combine
    return {
        ...saleData,
        items: itemsResult.rows
    };
}


async function updateSale(sale_id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    if (keys.length === 0) return null;

    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

    const query = `UPDATE sales SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;

    const allValues = [...values, sale_id];
    const result = await pool.query(query, allValues);
    return result.rows[0];
}

async function deleteSale(sale_id) {
    const result = await pool.query(
        `DELETE FROM sales WHERE id = $1 RETURNING *`,
        [sale_id]
    )
    return result.rows[0]
}
export default { findItem, saleCreate, saleItemCreate, findAllSales, findSale, updateSale, deleteSale }