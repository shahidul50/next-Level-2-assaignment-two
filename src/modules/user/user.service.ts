import { pool } from "../../config/db";

const getAllUser = async () => {
  return await pool.query(`SELECT id, name, email, phone, role FROM users`);
};

const updateUser = async (
  fields: string[],
  values: string[],
  index: number
) => {
  const updateQuery = `
        UPDATE users 
        SET ${fields.join(", ")}
        WHERE id = $${index}
        RETURNING id, name, email, phone, role;
      `;

  return await pool.query(updateQuery, values);
};

const deleteUser = async (userId: string) => {
  return await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
};

const getUserById = async (userId: string) => {
  return await pool.query(
    `SELECT id, name, email, phone, role FROM users WHERE id= $1`,
    [userId]
  );
};
const getUserByEmail = async (email: string) => {
  return await pool.query(
    `SELECT id, name, email, phone, role FROM users WHERE email= $1`,
    [email]
  );
};

export const userService = {
  getAllUser,
  updateUser,
  deleteUser,
  getUserById,
  getUserByEmail,
};
