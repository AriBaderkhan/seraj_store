import pool from '../db_connection.js'


async function createBrand({ name, description, created_by }) {
    const query = `INSERT INTO brands (brand_name,description,created_by) VALUES ($1,$2,$3) RETURNING *`;
    const values = [name, description, created_by];
    const result = await pool.query(query, values);
    return result.rows[0];
}

async function findAllBrands() {
    const query = `
    SELECT 
    b.id,
    b.brand_name,
    b.description,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT('category_id', c.id, 'category_name', c.category_name)
        ) FILTER (WHERE c.id IS NOT NULL),
        '[]'::json
    ) AS categories
    FROM brands b
    LEFT JOIN category_brands cb ON b.id = cb.brand_id
    LEFT JOIN categories c ON cb.category_id = c.id
    GROUP BY b.id
    `;
    const result = await pool.query(query);
    return result.rows;
}

async function findBrandById(brand_id) {
    const query = `
    SELECT 
    b.id,
    b.brand_name,
    b.description,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT('category_id', c.id, 'category_name', c.category_name)
        ) FILTER (WHERE c.id IS NOT NULL),
        '[]'::json
    ) AS categories
    FROM brands b
    LEFT JOIN category_brands cb ON b.id = cb.brand_id
    LEFT JOIN categories c ON cb.category_id = c.id
    WHERE b.id = $1
    GROUP BY b.id
    `;
    const values = [brand_id];
    const result = await pool.query(query, values);
    return result.rows[0];
}

async function updateBrand(brand_id, { name, description, updated_by }) {
    const query = `
        UPDATE brands
        SET brand_name = COALESCE($1, brand_name),
            description = COALESCE($2, description),
            updated_by = $3
        WHERE id = $4
        RETURNING *;
    `;

    const values = [name, description, updated_by, brand_id];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
}

async function deleteBrandById(brand_id) {
    const query = `DELETE FROM brands WHERE id=$1 RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0]
}

async function findBrandsByCategoryId(category_id) {
    const query = `
    SELECT b.*
    FROM brands b
    JOIN category_brands cb ON b.id = cb.brand_id
    WHERE cb.category_id = $1
    `;
    const values = [category_id];
    const result = await pool.query(query, values);
    return result.rows;
}

export default { createBrand, findAllBrands, findBrandById, updateBrand, deleteBrandById, findBrandsByCategoryId }