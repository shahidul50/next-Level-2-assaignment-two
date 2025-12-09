import { Request, Response } from "express";
import { SendError, SendSuccess } from "../../helpers/sendResponse";
import { userService } from "./user.service";
import { bookingService } from "../booking/booking.service";
import isValidEmail from "../../helpers/isValidEmail";
import bcrypt from "bcryptjs";

const getAllUser = async (req: Request, res: Response) => {
  try {
    const result: any = await userService.getAllUser();
    SendSuccess(res, 200, true, "Users retrieved successfully", result?.rows);
  } catch (error: any) {
    SendError(res, 500, false, "Internal Server Error", error.message);
  }
};

const updateUser = async (req: Request, res: Response) => {
  const userId: string = req.params.userId!;
  const isAdmin = req.user?.role === "admin";
  const isCustomer = req.user?.role === "customer";
  const loggedInCustomer = req?.user;
  const roles = ["admin", "customer"];

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
    const { name, email, phone, role, password } = req.body;

    //checking email is valid or not
    if (email && !isValidEmail(email)) {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Please provide a valid email!!"
      );
    }

    //checking password isn't empty
    if (password === "") {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Password is required!"
      );
    }

    //checking password length at least 6 or not
    if (password && password.length < 6) {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Password must be at least 6 characters"
      );
    }

    //checking role is include system role or not
    if (role && !roles.includes(role)) {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Role must be admin or customer"
      );
    }

    //checking role is include system role or not
    if (role && isCustomer) {
      return SendError(
        res,
        403,
        false,
        "Forbidden",
        "You don't have permission to change user role"
      );
    }

    try {
      //checking user exist or not
      const dbUser = await userService.getUserById(userId);
      const isUserExist = dbUser.rowCount === 0 ? false : true;
      if (!isUserExist) {
        return SendError(
          res,
          404,
          false,
          "User not found",
          "No user found with the given ID"
        );
      }

      //checking is logged in customer equal or not db user
      if (isCustomer && dbUser.rows[0].id !== loggedInCustomer?.id) {
        return SendError(
          res,
          403,
          false,
          "Forbidden",
          "You are not change another user details!"
        );
      }

      if (email) {
        //checking email exist or not
        const getUserWithEmail = await userService.getUserByEmail(email);
        const isEmailExist = getUserWithEmail.rowCount === 0 ? false : true;

        //checking is own email or not
        let isEmailSame;
        if (isEmailExist) {
          isEmailSame =
            loggedInCustomer?.email === getUserWithEmail.rows[0].email;
        }

        if (isEmailExist && !isEmailSame) {
          return SendError(
            res,
            400,
            false,
            "Validation failed",
            "Email already exist!!"
          );
        }
      }
      let hashPassword;
      if (password) {
        hashPassword = await bcrypt.hash(password, 10);
      }
      //dynamic update query
      const fields = [];
      const values = [];
      let index = 1;

      if (name) {
        fields.push(`name = $${index++}`);
        values.push(name);
      }

      if (email) {
        fields.push(`email = $${index++}`);
        values.push(email);
      }

      if (phone) {
        fields.push(`phone = $${index++}`);
        values.push(phone);
      }

      if (isAdmin && role) {
        fields.push(`role = $${index++}`);
        const userRole = role.toLowerCase();
        values.push(userRole);
      }
      if (password) {
        fields.push(`password = $${index++}`);
        values.push(hashPassword);
      }

      values.push(userId);

      const updatedResult = await userService.updateUser(fields, values, index);

      SendSuccess(
        res,
        200,
        true,
        "User updated successfully",
        updatedResult?.rows[0]
      );
    } catch (error: any) {
      SendError(res, 500, false, "Internal Server Error", error.message);
    }
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  try {
    if (userId) {
      //checking if user exist or not
      const isExistUser = await userService.getUserById(userId);
      if (isExistUser.rowCount === 0) {
        return SendError(
          res,
          404,
          false,
          "User not found",
          "No user found with the given ID"
        );
      }
      //checking booking status is active or not
      const bookingStatus =
        await bookingService.getAllBookingStatusByCustomerId(userId);

      const isDeletable = bookingStatus.rows.some(
        (item) => item.status === "active"
      );

      if (isDeletable) {
        return SendError(
          res,
          403,
          false,
          "Forbidden",
          "Can not delete this customer because he has a booking"
        );
      }
      await userService.deleteUser(userId);
      SendSuccess(res, 200, true, "Users Deleted successfully");
    }
  } catch (error: any) {
    SendError(res, 500, false, "Internal Server Error", error.message);
  }
};

export const userController = {
  getAllUser,
  updateUser,
  deleteUser,
};
