import { Request, Response } from "express";
import { SendError, SendSuccess } from "../../helpers/sendResponse";
import getDaysBetween from "../../helpers/getDaysBetween";
import { vehicleService } from "../vehicle/vehicle.service";
import { bookingService } from "./booking.service";
import { userService } from "../user/user.service";
import updateBookingStatusBySystem from "../../helpers/updateBookingStatusBySystem";

const createBooking = async (req: Request, res: Response) => {
  if (req.body !== undefined) {
    const isAdmin = req.user?.role === "admin";
    const isCustomer = req.user?.role === "customer";
    const customer = req.user;

    //checking customerId isn't empty when admin logged in
    if (req.body.customer_id === undefined && isAdmin === true) {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Customer Id is required!"
      );
    }

    //checking vehicleId isn't empty
    if (req.body.vehicle_id === undefined) {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Vehicle Id is required!"
      );
    }

    //checking rent start date isn't empty
    if (
      req.body.rent_start_date === undefined ||
      req.body.rent_start_date === ""
    ) {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Rent start date is required!"
      );
    }
    //checking rent end date isn't empty
    if (req.body.rent_end_date === undefined || req.body.rent_end_date === "") {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Rent end date is required!"
      );
    }

    //checking rent_end_date gather then from rent_start_date
    if (req.body.rent_start_date >= req.body.rent_end_date) {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Rent start date cannot be earlier than the rent end date!"
      );
    }

    try {
      const selectedVehicleDetails = await vehicleService.getVehicleById(
        req.body.vehicle_id
      );
      //checking vehicle is exist or not and availability_status isn't booked
      if (
        selectedVehicleDetails.rows.length === 0 ||
        selectedVehicleDetails.rows[0].availability_status === "booked"
      ) {
        return SendError(
          res,
          404,
          false,
          "Vehicle not found",
          "No vehicle found with the given ID"
        );
      }

      let dbUser;
      if (isAdmin) {
        dbUser = await userService.getUserById(req.body.customer_id);
      }

      if (isCustomer) {
        dbUser = await userService.getUserById(customer?.id);
      }

      const isExistCustomer = dbUser?.rowCount === 0 ? false : true;

      //checking is user(customer) exist or not
      if (!isExistCustomer) {
        return SendError(
          res,
          404,
          false,
          "User not found",
          "No user found with the given ID"
        );
      }

      //get number of booking days
      const numberOfDays: number =
        getDaysBetween(req.body.rent_start_date, req.body.rent_end_date) + 1;
      //calculate total price for rent
      const totalPrice: number =
        Number(selectedVehicleDetails.rows[0].daily_rent_price) * numberOfDays;
      let finalBookingObj = {};

      if (isAdmin) {
        finalBookingObj = {
          customer_id: req.body.customer_id,
          vehicle_id: req.body.vehicle_id,
          rent_start_date: req.body.rent_start_date,
          rent_end_date: req.body.rent_end_date,
          total_price: totalPrice,
          status: "active",
        };
      } else {
        finalBookingObj = {
          customer_id: customer?.id,
          vehicle_id: req.body.vehicle_id,
          rent_start_date: req.body.rent_start_date,
          rent_end_date: req.body.rent_end_date,
          total_price: totalPrice,
          status: "active",
        };
      }

      const result = await bookingService.createBooking(finalBookingObj);
      const selectedVehicleId = selectedVehicleDetails?.rows[0].id;
      if (result.rowCount !== 0) {
        //update availability_status on vehicle database table
        await vehicleService.updateVehicle(
          ["availability_status = $1 "],
          ["booked", selectedVehicleId],
          2
        );
      }

      const responseData = {
        ...result?.rows[0],
        rent_start_date: new Date(result?.rows[0].rent_start_date)
          .toISOString()
          .split("T")[0],
        rent_end_date: new Date(result?.rows[0].rent_end_date)
          .toISOString()
          .split("T")[0],
        total_price: Number(result?.rows[0].total_price),

        vehicle: {
          vehicle_name: selectedVehicleDetails.rows[0].vehicle_name,
          daily_rent_price: Number(
            selectedVehicleDetails.rows[0].daily_rent_price
          ),
        },
      };
      SendSuccess(res, 201, true, "Booking created successfully", responseData);
    } catch (error: any) {
      SendError(res, 500, false, "Internal Server Error", error.message);
    }
  } else {
    SendError(
      res,
      400,
      false,
      "Validation Error",
      "Please provide customer_id, vehicle_id, rent_start_date, rent_end_date"
    );
  }
};

const getAllBooking = async (req: Request, res: Response) => {
  const isAdmin = req.user?.role === "admin";
  const isCustomer = req.user?.role === "customer";
  const customerId = req?.user?.id;

  //System: Auto-mark as "returned" when period ends
  updateBookingStatusBySystem();
  try {
    const result = await bookingService.getAllBooking(isAdmin, customerId);

    if (isAdmin) {
      const finalResponse = await Promise.all(
        result.rows.map(async (booking) => {
          const customerDetails = await userService.getUserById(
            booking.customer_id
          );

          const vehicleDetails = await vehicleService.getVehicleById(
            booking.vehicle_id
          );
          const obj = {
            ...booking,
            rent_start_date: new Date(booking.rent_start_date)
              .toISOString()
              .split("T")[0],
            rent_end_date: new Date(booking.rent_end_date)
              .toISOString()
              .split("T")[0],
            total_price: Number(booking.total_price),
            customer: {
              name: customerDetails.rows[0].name,
              email: customerDetails.rows[0].email,
            },
            vehicle: {
              vehicle_name: vehicleDetails.rows[0].vehicle_name,
              registration_number: vehicleDetails.rows[0].registration_number,
            },
          };

          return obj;
        })
      );

      const message =
        finalResponse.length === 0
          ? "No booking found"
          : "Bookings retrieved successfully";
      SendSuccess(res, 200, true, message, finalResponse);
    }

    if (isCustomer) {
      const finalResponse = await Promise.all(
        result.rows.map(async (booking) => {
          const vehicleDetails = await vehicleService.getVehicleById(
            booking.vehicle_id
          );
          const obj = {
            ...booking,
            rent_start_date: new Date(booking.rent_start_date)
              .toISOString()
              .split("T")[0],
            rent_end_date: new Date(booking.rent_end_date)
              .toISOString()
              .split("T")[0],
            total_price: Number(booking.total_price),
            vehicle: {
              vehicle_name: vehicleDetails.rows[0].vehicle_name,
              registration_number: vehicleDetails.rows[0].registration_number,
              type: vehicleDetails.rows[0].type,
            },
          };

          return obj;
        })
      );
      const message =
        finalResponse.length === 0
          ? "No booking found"
          : "Your bookings retrieved successfully";
      SendSuccess(res, 200, true, message, finalResponse);
    }
  } catch (error: any) {
    SendError(res, 500, false, "Internal Server Error", error.message);
  }
};
const updateBooking = async (req: Request, res: Response) => {
  if (req.body !== undefined) {
    const isAdmin = req.user?.role === "admin";
    const isCustomer = req.user?.role === "customer";
    const customerId = req.user?.id;
    const validStatusArray = ["returned", "cancelled"];
    const bookingId = req.params.bookingId;

    if (!validStatusArray.includes(req.body.status)) {
      return SendError(
        res,
        400,
        false,
        "Validation Error",
        "Status value must be in (cancelled or returned)"
      );
    }

    if (isCustomer && req.body.status === "returned") {
      return SendError(
        res,
        400,
        false,
        "Validation Error",
        "You don't have permission to set returned"
      );
    }
    if (isAdmin && req.body.status === "cancelled") {
      return SendError(
        res,
        400,
        false,
        "Validation Error",
        "You don't have permission to set cancelled"
      );
    }

    try {
      const isBooking = await bookingService.isExistBooking(bookingId!);

      if (!isBooking) {
        return SendError(
          res,
          404,
          false,
          "Booking Data not found",
          "No booking found with the given ID"
        );
      }

      const bookingData = await bookingService.getBookingById(bookingId!);
      const rentStartDate = new Date(
        bookingData.rows[0].rent_start_date
      ).toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

      if (
        isCustomer &&
        Math.floor(getDaysBetween(rentStartDate, new Date().toString())) > 0
      ) {
        return SendError(
          res,
          403,
          false,
          "Forbidden",
          "You cannot cancelled after start date"
        );
      }

      if (bookingData.rows[0].status === "cancelled") {
        return SendError(
          res,
          403,
          false,
          "Forbidden",
          "You cannot change status returned because its was cancelled before"
        );
      }
      const isUpdatable = (
        await bookingService.getAllBookingIdByCustomerId(customerId)
      ).rows.some((item) => item.id === Number(bookingId!));

      if (isCustomer && !isUpdatable) {
        return SendError(
          res,
          403,
          false,
          "Forbidden",
          "You are not change another customer status!"
        );
      }

      if (isAdmin) {
        const result = await bookingService.updateBooking(
          req.body.status,
          bookingId!
        );
        const updateVehicle = await vehicleService.updateVehicle(
          ["availability_status = $1"],
          ["available", bookingData.rows[0].vehicle_id],
          2
        );

        const modifiedResult = {
          ...result.rows[0],
          rent_start_date: new Date(result?.rows[0].rent_start_date)
            .toISOString()
            .split("T")[0],
          rent_end_date: new Date(result?.rows[0].rent_end_date)
            .toISOString()
            .split("T")[0],
          total_price: Number(result.rows[0].total_price),
          vehicle: {
            availability_status: updateVehicle.rows[0].availability_status,
          },
        };
        SendSuccess(
          res,
          200,
          true,
          "Booking marked as returned. Vehicle is now available",
          modifiedResult
        );
      } else {
        const result = await bookingService.updateBooking(
          req.body.status,
          bookingId!
        );
        await vehicleService.updateVehicle(
          ["availability_status = $1"],
          ["available", bookingData.rows[0].vehicle_id],
          2
        );
        const modifiedResult = {
          ...result?.rows[0],
          rent_start_date: new Date(result?.rows[0].rent_start_date)
            .toISOString()
            .split("T")[0],
          rent_end_date: new Date(result?.rows[0].rent_end_date)
            .toISOString()
            .split("T")[0],
          total_price: Number(result.rows[0].total_price),
        };
        SendSuccess(
          res,
          200,
          true,
          "Booking cancelled successfully",
          modifiedResult
        );
      }
    } catch (error: any) {
      SendError(res, 500, false, "Internal Server Error", error.message);
    }
  } else {
    return SendError(
      res,
      400,
      false,
      "Validation Error",
      "Please provide status(cancelled or returned)"
    );
  }
};

export const bookingController = {
  createBooking,
  getAllBooking,
  updateBooking,
};
