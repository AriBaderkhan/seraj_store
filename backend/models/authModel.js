import pool from '../db_connection.js'


async function checkLogin(username) {
    const query = `SELECT 
    * FROM users WHERE username=$1`;
    const value = [username];
    const result = await pool.query(query, value);
    return result.rows[0];
}



export default { checkLogin }