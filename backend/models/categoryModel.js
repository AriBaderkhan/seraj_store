import pool from '../db_connection.js';

async function create({ name, description, image }) {
    const query = `INSERT INTO categories (category_name,description,image) VALUES ($1,$2,$3) RETURNING *`;
    const values = [name, description, image];
    const result = await pool.query(query, values);
    return result.rows[0]
}

async function findAll() {
    const query = `SELECT * FROM categories`;
    const result = await pool.query(query);
    return result.rows
}

async function findCategoryById(category_id) {
    const query = `SELECT * FROM categories WHERE id=$1`;
    const values = [category_id];
    const result = await pool.query(query, values);
    return result.rows[0]
}


async function updateById(name, description, image, category_id) {
    const query = `UPDATE categories
SET category_name = COALESCE($1, category_name),
    description   = COALESCE($2, description),
    image         = COALESCE($3, image)
WHERE id = $4
RETURNING *;`

    const allValues = [name, description, image, category_id];
    const { rows } = await pool.query(query, allValues);
    return rows[0] || null;
}
async function deleteCategoryById(category_id) {
    const query = `DELETE FROM categories WHERE id=$1 RETURNING *`;
    const result = await pool.query(query, [category_id]);
    return result.rows[0]
}

export default { create, findAll, findCategoryById, updateById, deleteCategoryById }