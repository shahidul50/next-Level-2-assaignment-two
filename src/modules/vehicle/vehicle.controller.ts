import { Request, Response } from "express";
import { SendError, SendSuccess } from "../../helpers/sendResponse";
import { vehicleService } from "./vehicle.service";
import { bookingService } from "../booking/booking.service";
import castDailyRentPriceStringToNumber from "../../helpers/castRentPriceStringToNumber";

const createVehicle = async (req: Request, res: Response) => {
  if (req.body !== undefined) {
    const vehicleTypes = ["car", "bike", "van", "SUV"];
    const { vehicle_name, type, registration_number, daily_rent_price } =
      req.body;

    //checking vehicle name isn't empty
    if (vehicle_name === undefined || vehicle_name === "") {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Vehicle Name is required!"
      );
    }

    //checking vehicle type isn't empty
    if (type === undefined || type === "") {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Vehicle type is required!"
      );
    }

    //checking vehicle type is in system types
    if (!vehicleTypes.includes(type)) {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Vehicle type must be 'car', 'bike', 'van' or 'SUV'!"
      );
    }

    //checking registration number isn't empty
    if (registration_number === undefined || registration_number === "") {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Registration Number is required!"
      );
    }

    //checking daily rent price isn't empty
    if (daily_rent_price === undefined || daily_rent_price === "") {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Daily Rent Price is required!"
      );
    }

    //checking daily rent price is positive number
    if (Number(daily_rent_price) < 0) {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Rent Price must be Positive Number!"
      );
    }

    try {
      //checking is registration number exist or not
      const getVehicleResult =
        await vehicleService.getVehicleByRegistrationNumber(
          registration_number
        );
      const isExistRegistrationNumberExist =
        getVehicleResult.rowCount === 0 ? false : true;

      if (isExistRegistrationNumberExist) {
        return SendError(
          res,
          400,
          false,
          "Validation failed",
          "Registration Number Already Exist!"
        );
      }

      //create new vehicle
      const result: any = await vehicleService.createVehicle(req.body);
      const modifiedResult = castDailyRentPriceStringToNumber(result.rows);
      SendSuccess(
        res,
        201,
        true,
        "Vehicle created successfully",
        modifiedResult
      );
    } catch (error: any) {
      SendError(res, 500, false, "Internal Server Error", error.message);
    }
  } else {
    return SendError(
      res,
      400,
      false,
      "Validation failed",
      "Please provide vehicle_name, type, registration_number, daily_rent_price and availability_status."
    );
  }
};
const getAllVehicle = async (req: Request, res: Response) => {
  try {
    //get all vehicle from database
    const result: any = await vehicleService.getAllVehicle();
    //casting type (string to number) for daily rent price field
    const modifiedResult = castDailyRentPriceStringToNumber(result.rows);

    const message: string =
      result.rows.length !== 0
        ? "Vehicles retrieved successfully"
        : "No vehicles found";
    SendSuccess(res, 200, true, message, modifiedResult);
  } catch (error: any) {
    SendError(res, 500, false, "Internal Server Error", error.message);
  }
};

const getVehicleById = async (req: Request, res: Response) => {
  const vehicleId = req.params.vehicleId;
  try {
    if (vehicleId) {
      //get vehicle details by id from database
      const result: any = await vehicleService.getVehicleById(vehicleId);
      //casting type (string to number) for daily rent price field
      const modifiedResult = castDailyRentPriceStringToNumber(result.rows);
      const message: string =
        result.rows.length !== 0
          ? "Vehicles retrieved successfully"
          : "No vehicle found with the given ID";
      SendSuccess(res, 200, true, message, modifiedResult);
    }
  } catch (error: any) {
    SendError(res, 500, false, "Internal Server Error", error.message);
  }
};

const updateVehicle = async (req: Request, res: Response) => {
  const vehicleId: string = req.params.vehicleId!;
  const vehicleTypes = ["car", "bike", "van", "SUV"];
  const statusTypes = ["available", "booked"];

  //checking req.body isn't empty
  if (req.body === undefined || Object.keys(req.body).length === 0) {
    return SendError(
      res,
      400,
      false,
      "Nothing to update",
      "No valid fields provided"
    );
  } else {
    const {
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    } = req.body;
    //checking daily rent price isn't negative
    if (daily_rent_price && daily_rent_price < 0) {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Rent Price must be Positive Number!"
      );
    }

    //checking type is include in system types or not
    if (type && !vehicleTypes.includes(type)) {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Vehicle type must be 'car', 'bike', 'van' or 'SUV'!"
      );
    }

    //checking availability status is include in system status or not
    if (
      (availability_status && !statusTypes.includes(availability_status)) ||
      availability_status === ""
    ) {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Availability status must be in 'available' or 'booked'!"
      );
    }

    try {
      //checking vehicle is exist or not
      const getVehicleResult = await vehicleService.getVehicleById(vehicleId);
      const isExistVehicle = getVehicleResult.rowCount === 0 ? false : true;
      if (!isExistVehicle) {
        return SendError(
          res,
          404,
          false,
          "Vehicle not found",
          "No vehicle found with the given ID"
        );
      }

      //checking registration number is exist or not
      if (registration_number) {
        const result = await vehicleService.getVehicleByRegistrationNumber(
          registration_number
        );
        const isExistRegistrationNumber = result?.rowCount === 0 ? false : true;

        //checking is own registration number or not
        let isRegistrationNumberSame;
        if (isExistRegistrationNumber) {
          isRegistrationNumberSame =
            getVehicleResult.rows[0].registration_number ===
            result.rows[0].registration_number;
        }

        if (isExistRegistrationNumber && !isRegistrationNumberSame) {
          return SendError(
            res,
            400,
            false,
            "Validation failed",
            "Registration Number Already Exist!"
          );
        }
      }

      //dynamic update query
      const fields = [];
      const values = [];
      let index = 1;

      if (vehicle_name) {
        fields.push(`vehicle_name = $${index++}`);
        values.push(vehicle_name);
      }

      if (type) {
        fields.push(`type = $${index++}`);
        values.push(type);
      }

      if (registration_number) {
        fields.push(`registration_number = $${index++}`);
        values.push(registration_number);
      }

      if (daily_rent_price) {
        fields.push(`daily_rent_price = $${index++}`);
        values.push(daily_rent_price);
      }
      if (availability_status) {
        fields.push(`availability_status = $${index++}`);
        values.push(availability_status);
      }

      values.push(vehicleId);

      //update vehicle with given field by vehicleId
      const updatedResult = await vehicleService.updateVehicle(
        fields,
        values,
        index
      );
      //casting type (string to number) for daily rent price field
      const modifiedResult = castDailyRentPriceStringToNumber(
        updatedResult.rows
      );

      SendSuccess(
        res,
        200,
        true,
        "Vehicle updated successfully",
        modifiedResult
      );
    } catch (error: any) {
      SendError(res, 500, false, "Internal Server Error", error.message);
    }
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  const vehicleId = req.params.vehicleId;
  try {
    if (vehicleId) {
      //checking if vehicle exist or not
      const isExistVehicle = await vehicleService.getVehicleById(vehicleId);
      if (isExistVehicle.rowCount === 0) {
        return SendError(
          res,
          404,
          false,
          "Vehicle not found",
          "No vehicle found with the given ID"
        );
      }
      //checking booking status is active or not
      const bookingStatusArray =
        await bookingService.getAllBookingStatusByVehicleId(vehicleId);

      const isDeletable = bookingStatusArray.rows.some(
        (item) => item.status === "active"
      );

      //can't delete vehicle when its booked
      if (isDeletable) {
        return SendError(
          res,
          403,
          false,
          "Forbidden",
          "Can not delete this vehicle because it was booked"
        );
      }
      await vehicleService.deleteVehicle(vehicleId);
      SendSuccess(res, 200, true, "Vehicle Deleted successfully");
    }
  } catch (error: any) {
    SendError(res, 500, false, "Internal Server Error", error.message);
  }
};

export const vehicleController = {
  createVehicle,
  getAllVehicle,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
