import pool from '../db_connection.js';

async function itemsInStock() {
    const query = `
    SELECT 
        COALESCE(SUM(stock_qty), 0) AS total_quantity
    FROM items
    `
    const result = await pool.query(query)
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
        COALESCE(SUM(si.quantity), 0) AS number_of_sold_items
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    WHERE s.created_at BETWEEN $1 AND $2
    `
    const result = await pool.query(query, [from, to])
    return result.rows[0]
}

async function top5SaleItems() {
    const query = `
    SELECT
        i.name AS item_name,
        COALESCE(SUM(si.quantity),0) AS total_quantity
    FROM sale_items si
    JOIN items i ON si.item_id = i.id
    GROUP BY si.item_id,i.name
    ORDER BY total_quantity DESC
    LIMIT 5;
  `;
    const { rows } = await pool.query(query);
    const top5SaleItems = rows;
    return top5SaleItems

}

export default { itemsInStock, numOfSales, numOfAllSoldItems, top5SaleItems }