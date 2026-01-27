import pool from '../db_connection.js';

async function createPurchase(client = pool, { created_by, notes }) {
    const query = `INSERT INTO purchases (created_by,purchase_notes) VALUES ($1,$2) RETURNING *`;
    const values = [created_by, notes];
    const result = await client.query(query, values);
    return result.rows[0]
}


async function findDeviceById(client = pool, device_id) {
    const query = 'SELECT * FROM item_imeis WHERE id = $1'
    const result = await client.query(query, [device_id])
    return result.rows[0]
}

async function updateDevice(client = pool, deviceFields, device_id, updated_by) {
    const keys = Object.keys(deviceFields);
    const values = Object.values(deviceFields);
    if (keys.length === 0) return null;

    keys.push('updated_by');
    values.push(updated_by);

    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

    const query = `UPDATE item_imeis SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`;

    // Use client if provided (transaction), else pool
    const executor = client || pool;
    const allValues = [...values, device_id];
    const result = await executor.query(query, allValues);
    return result.rows[0];
}


async function deleteDevice(client = pool, device_id) {
    const query = 'DELETE FROM item_imeis WHERE id = $1'
    const result = await client.query(query, [device_id])
    return result.rows[0]
}


async function findOtherItemById(client = pool, other_item_id) {
    const query = 'SELECT * FROM purchase_items WHERE id = $1'
    const result = await client.query(query, [other_item_id])
    return result.rows[0]
}

async function updateOtherItem(client = pool, other_item_fields, other_item_id) {
    const keys = Object.keys(other_item_fields);
    const values = Object.values(other_item_fields);
    if (keys.length === 0) return null;

    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

    const query = `UPDATE purchase_items SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`;

    // Use client if provided (transaction), else pool
    const executor = client || pool;
    const allValues = [...values, other_item_id];
    const result = await executor.query(query, allValues);
    return result.rows[0];
}


async function deleteOtherItem(client = pool, other_item_id) {
    const query = 'DELETE FROM purchase_items WHERE id = $1'
    const result = await client.query(query, [other_item_id])
    return result.rows[0]
}



export default { createPurchase, findDeviceById, updateDevice, deleteDevice, findOtherItemById, updateOtherItem, deleteOtherItem }