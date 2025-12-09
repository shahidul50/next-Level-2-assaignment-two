import { Request } from "express";
import { pool } from "../../config/db";

const createBooking = async (payload: Record<string, unknown>) => {
  return await pool.query(
    `INSERT INTO bookings(customer_id,vehicle_id,rent_start_date,rent_end_date,total_price,status)VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      payload.customer_id,
      payload.vehicle_id,
      payload.rent_start_date,
      payload.rent_end_date,
      payload.total_price,
      payload.status,
    ]
  );
};
const getAllBooking = async (isAdmin: boolean, customerId: string) => {
  if (isAdmin) {
    return await pool.query(`SELECT * FROM bookings`);
  } else {
    return await pool.query(`SELECT * FROM bookings WHERE customer_id = $1`, [
      customerId,
    ]);
  }
};

const getAllBookingForAutoUpdate = async () => {
  return await pool.query(`SELECT * FROM bookings`);
};
const updateBooking = async (status: string, bookingId: string) => {
  return await pool.query(
    `UPDATE bookings SET status = $1 WHERE id= $2 RETURNING *`,
    [status, bookingId]
  );
};

const isExistBooking = async (bookingId: string) => {
  const result = await pool.query("SELECT * FROM bookings WHERE id = $1", [
    bookingId,
  ]);

  return result.rowCount !== 0 ? true : false;
};

const getAllBookingIdByCustomerId = async (customerId: string) => {
  return await pool.query("SELECT id FROM bookings WHERE customer_id = $1", [
    customerId,
  ]);
};

const getAllBookingStatusByCustomerId = async (customerId: string) => {
  return await pool.query(
    "SELECT status FROM bookings WHERE customer_id = $1",
    [customerId]
  );
};

const getAllBookingStatusByVehicleId = async (vehicleId: string) => {
  return await pool.query("SELECT status FROM bookings WHERE vehicle_id = $1", [
    vehicleId,
  ]);
};

const getBookingById = async (bookingId: string) => {
  return await pool.query("SELECT * FROM bookings WHERE id = $1", [bookingId]);
};

export const bookingService = {
  createBooking,
  getAllBooking,
  updateBooking,
  isExistBooking,
  getAllBookingIdByCustomerId,
  getBookingById,
  getAllBookingStatusByCustomerId,
  getAllBookingStatusByVehicleId,
  getAllBookingForAutoUpdate,
};
