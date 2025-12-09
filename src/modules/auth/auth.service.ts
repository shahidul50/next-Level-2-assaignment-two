import config from "../../config";
import { pool } from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const Signup = async (payload: Record<string, unknown>) => {
  const { name, email, password, phone, role } = payload;

  //hashing user password for Safety
  const hashPassword = await bcrypt.hash(password as string, 10);

  return await pool.query(
    `INSERT INTO users(name,email,password,phone,role)VALUES($1, $2, $3, $4, $5) RETURNING id, name, email, phone,role`,
    [name, email, hashPassword, phone, role]
  );
};

const Signin = async (email: string) => {
  //collect login user data from database
  const result = await pool.query(
    `SELECT id, name, email, phone, role FROM users WHERE email=$1`,
    [email]
  );

  const user = result.rows[0];

  // create JWT Token for login user
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    config.jwtSecret as string,
    {
      expiresIn: "7d",
    }
  );
  return { token, user };
};

const isEmailExist = async (email: string) => {
  const result = await pool.query(`SELECT email from users where email = $1`, [
    email,
  ]);
  return result.rowCount === 0 ? false : true;
};

const getPasswordByEmail = async (email: string) => {
  const result = await pool.query(
    `SELECT password FROM users WHERE email= $1`,
    [email]
  );

  const userPassword = result.rows[0]?.password ? result.rows[0]?.password : "";

  return userPassword;
};

export const authService = { Signin, Signup, isEmailExist, getPasswordByEmail };
