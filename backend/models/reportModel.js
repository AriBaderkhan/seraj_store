import pool from '../db_connection.js';

async function itemsCameToStock(from, to) {
    const query = `
    SELECT 
        COALESCE(SUM(stock_qty), 0) AS items_came_to_stock
    FROM items
    WHERE created_at BETWEEN $1 AND $2
    `
    const result = await pool.query(query, [from, to])
    return result.rows[0]
}

async function numOfSales(from, to) {
    const query = `
    SELECT 
        COUNT(*) AS number_of_sales
    FROM sales
    WHERE created_at BETWEEN $1 AND $2
    `
    const result = await pool.query(query, [from, to])
    return result.rows[0]
}

async function numOfAllSoldItems(from, to) {
    const query = `
    SELECT 
        COALESCE(SUM(si.quantity), 0) AS num_of_all_sold_items
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    WHERE s.created_at BETWEEN $1 AND $2
    `
    const result = await pool.query(query, [from, to])
    return result.rows[0]
}

async function theMostSaleItem(from, to) {
    const query = `
    SELECT
        i.name AS item_name,
        COALESCE(SUM(si.quantity),0) AS total_quantity
    FROM sale_items si
    JOIN items i ON si.item_id = i.id
    JOIN sales s ON si.sale_id = s.id
    WHERE s.created_at BETWEEN $1 AND $2
    GROUP BY si.item_id,i.name
    ORDER BY total_quantity DESC
    LIMIT 1;
  `;
    const { rows } = await pool.query(query, [from, to]);
    const theMostSaleItem = rows[0];
    return theMostSaleItem

}

async function theLeastSaleItem(from, to) {
    const query = `
    SELECT
        i.name AS item_name,
        COALESCE(SUM(si.quantity),0) AS total_quantity
    FROM sale_items si
    JOIN items i ON si.item_id = i.id
    JOIN sales s ON si.sale_id = s.id
    WHERE s.created_at BETWEEN $1 AND $2
    GROUP BY si.item_id,i.name
    ORDER BY total_quantity ASC
    LIMIT 1;
  `;
    const { rows } = await pool.query(query, [from, to]);
    const theLeastSaleItem = rows[0];
    return theLeastSaleItem

}

async function totalExpenses(from, to) {
    const query = `SELECT COALESCE(SUM(amount),0) AS total_expenses FROM expenses WHERE created_at BETWEEN $1 AND $2`
    const result = await pool.query(query, [from, to])
    return result.rows[0]
}

async function totalRevenues(from, to) {
    const query = `SELECT COALESCE(SUM(total_paid),0) AS total_revenues FROM sales WHERE created_at BETWEEN $1 AND $2`
    const result = await pool.query(query, [from, to])
    return result.rows[0]
}

async function CogsForNonePhone(from, to) {
    const query = `
    SELECT
    COALESCE(SUM(si.quantity*pi.unit_cost),0) as cogs_non_phone
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    JOIN LATERAL (
        SELECT pi.unit_cost
        FROM purchase_items pi 
        WHERE pi.item_id = si.item_id
            AND pi.created_at <= s.created_at
        ORDER BY pi.created_at DESC
        LIMIT 1
    ) AS pi ON TRUE
    WHERE s.created_at BETWEEN $1 AND $2
    AND si.imei IS NULL`;
    const result = await pool.query(query, [from, to])
    return result.rows[0]
}

async function CogsForPhone(from, to) {
    const query = `
    SELECT
    COALESCE(SUM(si.quantity*ii.purchase_price),0) as cogs_phone
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    JOIN item_imeis ii ON (ii.imei1 = si.imei OR ii.imei2 = si.imei)
    WHERE s.created_at BETWEEN $1 AND $2
    AND ii.status = 'sold';`;
    const result = await pool.query(query, [from, to])
    return result.rows[0]
}


async function test() {
    const query = `SELECT i.name , T.purchase_price
        FROM items i
        JOIN LATERAL(
        select ii.purchase_price
        FROM item_imeis ii
        WHERE ii.item_id = i.id
        ORDER BY ii.purchase_price asc
        LIMIT 1) AS T ON TRUE `
    const result = await pool.query(query)
    return result.rows[0]
}

async function test1() {
    const query = `SELECT c.category_name, T.selling_price
        FROM categories c
        JOIN items i ON i.category_id = c.id
        JOIN LATERAL(
        select ii.selling_price
        FROM item_imeis ii 
        WHERE ii.item_id = i.id
        ORDER BY ii.selling_price desc
        LIMIT 1) AS T ON TRUE `
    const result = await pool.query(query)
    return result.rows
}
export default {
    itemsCameToStock, numOfSales, numOfAllSoldItems, theMostSaleItem, theLeastSaleItem,
    totalExpenses, totalRevenues, CogsForNonePhone, CogsForPhone, test1
}