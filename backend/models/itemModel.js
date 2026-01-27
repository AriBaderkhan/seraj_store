import pool from "../db_connection.js";

async function createItemPhones(client = pool, { name, brand_id, category_id, is_imei_required, details,
    image, storage, sim_type, color, created_by, serial_no }) {
    const query = `INSERT INTO items (name,brand_id,category_id,is_imei_required,details,
            image_path,storage,sim_type,color,created_by,serial_no) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`;
    const values = [name, brand_id, category_id, is_imei_required, details, image, storage, sim_type, color, created_by, serial_no];
    const result = await client.query(query, values);
    return result.rows[0]

}

async function createItemOthers(client = pool, { name, brand_id, category_id, stock_qty, is_imei_required, details,
    image, created_by, serial_no }) {
    const query = `INSERT INTO items (name,brand_id,category_id,stock_qty,is_imei_required,details,
            image_path,created_by,serial_no) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`;
    const values = [name, brand_id, category_id, stock_qty, is_imei_required, details, image, created_by, serial_no];
    const result = await client.query(query, values);
    return result.rows[0]
}

async function createImeiRow(client = pool, { item_id, imei1, imei2, purchase_price, selling_price, status, created_by, warranty_month, phone_detail, purchase_id }) {
    const query = `INSERT INTO item_imeis (item_id,imei1,imei2,purchase_price,selling_price,status,created_by,warranty_month,phone_detail,purchase_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`;
    const values = [item_id, imei1, imei2, purchase_price, selling_price, status, created_by, warranty_month, phone_detail, purchase_id];
    const result = await client.query(query, values);
    return result.rows[0]
}


async function createPurchaseRow(client = pool, { item_id, purchase_id, stock_qty, unit_cost, unit_sell_price, other_item_detail }) {
    const query = `INSERT INTO purchase_items (item_id,purchase_id,qty,unit_cost,unit_sell_price,other_item_detail) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
    const values = [item_id, purchase_id, stock_qty, unit_cost, unit_sell_price, other_item_detail];
    const result = await client.query(query, values);
    return result.rows[0]
}

async function updateItemStockQty(client = pool, item_id, update_stock_qty) {
    const query = `UPDATE items SET stock_qty = $1 WHERE id = $2`;
    const values = [update_stock_qty, item_id];
    await client.query(query, values);
}

// ********************** END OF CREATING ITEM **********************

async function findAllItemsByCategoryId(category_id, { search, color, storage, sim_type, brand_id } = {}) {
    let query = `
        SELECT id, brand_id, name, details, image_path, is_imei_required,
               storage, color, sim_type, stock_qty, serial_no,
               created_at
        FROM items
        WHERE category_id = $1
    `;
    const values = [category_id];

    if (search) {
        values.push(`%${search}%`);
        query += ` AND name ILIKE $${values.length}`;
    }

    if (color) {
        values.push(color);
        query += ` AND color = $${values.length}`;
    }

    if (storage) {
        values.push(storage);
        query += ` AND storage = $${values.length}`;
    }

    if (sim_type) {
        values.push(sim_type);
        query += ` AND sim_type = $${values.length}`;
    }

    if (brand_id) {
        values.push(brand_id);
        query += ` AND brand_id = $${values.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, values);
    return result.rows;
}

async function findItemById(item_id) {
    const query = `
        SELECT i.id, i.brand_id, i.category_id, i.name, i.details, i.image_path, i.is_imei_required,
               i.storage, i.color, i.sim_type, i.stock_qty, i.serial_no,
               i.created_at, i.updated_at,
               b.brand_name, c.category_name
        FROM items i
        LEFT JOIN brands b ON i.brand_id = b.id
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.id = $1
    `;
    const values = [item_id];
    const result = await pool.query(query, values);
    return result.rows[0];
}

async function findImeisByItemId(item_id) {
    const query = `
        SELECT id, imei1, imei2, status, purchase_price, selling_price, warranty_month, created_at
        FROM item_imeis 
        WHERE item_id = $1
    `;
    const values = [item_id];
    const result = await pool.query(query, values);
    return result.rows;
}

async function findPurchaseByItemId(item_id) {
    const query = `
        SELECT  pi.id, pi.unit_cost, pi.unit_sell_price, pi.qty, pi.other_item_detail,
        p.purchase_notes
        FROM purchase_items pi 
        JOIN purchases p ON pi.purchase_id = p.id 
        WHERE pi.item_id = $1
    `;
    const values = [item_id];
    const result = await pool.query(query, values);
    return result.rows;
}

// ********************** UPDATING ITEM **********************

async function updateItem(client, item_id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    if (keys.length === 0) return null;

    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

    const query = `UPDATE items SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`;

    // Use client if provided (transaction), else pool
    const executor = client || pool;
    const allValues = [...values, item_id];
    const result = await executor.query(query, allValues);
    return result.rows[0];
}

async function updateItemPhonePrice(client, item_id, purchase_price, selling_price, warranty_month) {
    const query = `UPDATE item_imeis SET purchase_price = $1,selling_price = $2,warranty_month = $3 WHERE item_id = $4`;
    const executor = client || pool;
    await executor.query(query, [purchase_price, selling_price, warranty_month, item_id]);
}

async function updateItemOtherStockCost(client, item_id, { stock_qty, unit_cost, unit_sell_price }) {
    // 1. Update stock_qty in items (handled by updateItem usually, but nice to have explicit helper if needed)
    // 2. Update unit_cost in purchase_items (all purchases for this item will be updated to correction price)
    const executor = client || pool;

    await executor.query(
        `
        UPDATE purchase_items
        SET
          unit_cost = COALESCE($1, unit_cost),
          unit_sell_price = COALESCE($2, unit_sell_price),
          qty       = COALESCE($3, qty)
        WHERE item_id = $4
        `,
        [unit_cost, unit_sell_price, stock_qty, item_id]
    );

    await executor.query(
        `
        UPDATE items
        SET stock_qty = COALESCE($1, stock_qty)
        WHERE id = $2
        `,
        [stock_qty, item_id]
    );
}

async function updatePurchaseNotesByItemId(client, item_id, notes) {
    const executor = client || pool;
    // Find all purchases linked to this item and update their notes
    const query = `
        UPDATE purchases 
        SET purchase_notes = COALESCE($1, purchase_notes)
        WHERE id IN (SELECT purchase_id FROM purchase_items WHERE item_id = $2)
    `;
    await executor.query(query, [notes, item_id]);
}

async function deleteImeisByItemId(client, item_id) {
    const query = `DELETE FROM item_imeis WHERE item_id = $1`;
    const executor = client || pool;
    await executor.query(query, [item_id]);
}

async function deletePurchaseItemsByItemId(client, item_id) {
    const query = `DELETE FROM purchase_items WHERE item_id = $1`;
    const executor = client || pool;
    await executor.query(query, [item_id]);
}

async function deleteItem(client, item_id) {
    const query = `DELETE FROM items WHERE id = $1`;
    const executor = client || pool;
    await executor.query(query, [item_id]);
}

export default {
    createItemPhones, createImeiRow, createItemOthers, createPurchaseRow,
    findAllItemsByCategoryId, findItemById, findImeisByItemId, findPurchaseByItemId,
    updateItem, updateItemPhonePrice, updateItemOtherStockCost, updatePurchaseNotesByItemId,
    updateItemStockQty, deleteItem, deleteImeisByItemId, deletePurchaseItemsByItemId
}
