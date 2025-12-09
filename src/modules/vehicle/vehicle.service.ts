import { pool } from "../../config/db";

const createVehicle = async (payload: Record<string, unknown>) => {
  const { vehicle_name, type, registration_number, daily_rent_price } = payload;
  const availability_status = "available";
  return await pool.query(
    `INSERT INTO vehicles(vehicle_name,type,registration_number,daily_rent_price,availability_status)VALUES($1, $2, $3, $4, $5) RETURNING *`,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ]
  );
};
const getAllVehicle = async () => {
  return await pool.query(`SELECT * FROM vehicles`);
};

const getVehicleById = async (vehicleId: string) => {
  return await pool.query(`SELECT * FROM vehicles WHERE id= $1`, [vehicleId]);
};

const updateVehicle = async (
  fields: string[],
  values: string[],
  index: number
) => {
  const updateQuery = `
            UPDATE vehicles 
            SET ${fields.join(", ")}
            WHERE id = $${index}
            RETURNING *;
          `;

  return await pool.query(updateQuery, values);
};

const deleteVehicle = async (vehicleId: string) => {
  return await pool.query(`DELETE FROM vehicles WHERE id = $1`, [vehicleId]);
};

const getVehicleByRegistrationNumber = async (registration_number: string) => {
  return await pool.query(
    `SELECT * FROM vehicles WHERE registration_number = $1`,
    [registration_number]
  );
};

export const vehicleService = {
  createVehicle,
  getAllVehicle,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getVehicleByRegistrationNumber,
};
