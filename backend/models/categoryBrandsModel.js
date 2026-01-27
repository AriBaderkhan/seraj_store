import pool from '../db_connection.js'

async function createLinkCB({ brand_id, category_id }) {
    const query = `INSERT INTO category_brands (brand_id, category_id) VALUES ($1, $2)`;
    const values = [brand_id, category_id];
    const result = await pool.query(query, values);
    return result.rows[0];
}

async function deleteLinksByBrandId(brand_id) {
    const query = `DELETE FROM category_brands WHERE brand_id = $1`;
    const values = [brand_id];
    const result = await pool.query(query, values);
    return result.rows;
}

export default { createLinkCB, deleteLinksByBrandId }