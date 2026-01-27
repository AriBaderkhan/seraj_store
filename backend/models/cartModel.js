import pool from "../db_connection.js";

async function createCart(item_id, item_name, imei = '', qty, selling_price) {
    const query = `
        INSERT INTO cart_items (item_id, item_name, imei, quantity, selling_price)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const { rows } = await pool.query(query, [item_id, item_name, imei, qty, selling_price]);
    return rows[0];
}

async function findtheCurrentCart() {
    const query = `
    SELECT 
        item_id,
        item_name, 
        COALESCE(SUM(row_total), 0) AS total_amount,
        SUM(quantity) AS qty 
        FROM cart_items
        GROUP BY item_id,item_name;`;
    const { rows } = await pool.query(query);
    return rows;
}


async function deleteCart(itemId) {
    // We are deleting by item_id now because the frontend groups items and doesn't have the individual row primary key.
    // CAUTION: This removes ALL entries of this item_id. 
    // Ideally we should handle IMEI specificity if needed, but for now this solves the "can't delete" issue for the grouped items.
    // If the frontend passes an ID specific to the row (like for phones with IMEI), we might need to be more specific.
    // But currently frontend passes 'item.id' which is 'item_id'.
    const query = "DELETE FROM cart_items WHERE item_id = $1 RETURNING *";
    const { rows } = await pool.query(query, [itemId]);
    return rows[0];
}

async function deleteEntireCart() {
    const query = "DELETE FROM cart_items RETURNING *";
    const { rows } = await pool.query(query);
    return rows;
}


async function findAllItemsInCart() {
    const query = "SELECT * FROM cart_items";
    const { rows } = await pool.query(query);
    return rows;
}


export default { createCart, findtheCurrentCart, deleteCart, deleteEntireCart, findAllItemsInCart };