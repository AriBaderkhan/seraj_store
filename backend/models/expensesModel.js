import pool from '../db_connection.js';

async function create(type, amount, expense_date, note, cretaed_by) {
    const result = await pool.query(
        `INSERT INTO expenses (type,amount,expense_date,note,created_by) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [type, amount, expense_date, note, cretaed_by]
    )
    return result.rows[0]
}

async function findAllExpenses(type, month) {
    const baseQuery = `SELECT * FROM expenses `;

    const where = [];
    const values = [];
    let idx = 1;

    if (type) {
        where.push(`type = $${idx}`);
        values.push(type);
        idx++;
    }
    if (month) {
        where.push(`TO_CHAR(expense_date, 'Mon YYYY') = $${idx}`);
        values.push(month);
        idx++;
    }

    let query = baseQuery;
    if (where.length > 0) {
        query += ` WHERE ` + where.join(" AND ");
    }

    query += ` ORDER BY expense_date DESC`;
    const result = await pool.query(query, values);
    return result.rows
}

async function findAExpense(expenseId) {
    const query = `SELECT s.*,u.username as processed_by FROM expenses s
    LEFT JOIN users u ON s.created_by = u.id
    WHERE s.id=$1 `;
    const result = await pool.query(query, [expenseId]);
    return result.rows[0]
}

async function updateExpense(expenseId, fields, updated_by) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    if (keys.length === 0) {
        throw createError('NO_FIELDS_TO_UPDATE', 'No fields provided to update');
    }

    // add updated_by column
    keys.push('updated_by');
    values.push(updated_by);

    const setClause = keys
        .map((key, idx) => `${key} = $${idx + 1}`)
        .join(', ');

    const query = `
    UPDATE expenses
       SET ${setClause},
           updated_at = NOW()
     WHERE id = $${keys.length + 1}
     RETURNING *;
  `;

    const allValues = [...values, expenseId];
    const { rows } = await pool.query(query, allValues);
    return rows[0] || null;
}

async function deleteExpense(expenseId) {
    const result = await pool.query(`DELETE FROM expenses WHERE id=$1 RETURNING *`, [expenseId]);
    return result.rows[0];
}
async function getAvailableMonths() {
    const query = `
        SELECT DISTINCT TO_CHAR(expense_date, 'Mon YYYY') as month,
        DATE_TRUNC('month', expense_date) as sort_date
        FROM expenses
        ORDER BY sort_date DESC
    `;
    const result = await pool.query(query);
    return result.rows.map(row => row.month);
}

async function getAvailableTypes() {
    const query = `
        SELECT DISTINCT type FROM expenses`;
    const result = await pool.query(query);
    return result.rows
}

export default { create, findAllExpenses, findAExpense, updateExpense, deleteExpense, getAvailableMonths, getAvailableTypes }