import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 5000,
  con_string: process.env.DB_CON_STRING,
  jwtSecret: process.env.JWT_SECRET,
};

export default config;
