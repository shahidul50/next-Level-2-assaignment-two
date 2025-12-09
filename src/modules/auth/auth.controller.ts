import { Request, Response } from "express";
import { SendError, SendSuccess } from "../../helpers/sendResponse";
import { authService } from "./auth.service";
import bcrypt from "bcryptjs";
import isValidEmail from "../../helpers/isValidEmail";

const Signup = async (req: Request, res: Response) => {
  //checking req.body is not empty.
  if (req.body !== undefined) {
    const { name, email, password, phone, role } = req.body;
    const roles = ["admin", "customer"];

    //checking name isn't empty
    if (name === undefined || name === "") {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Name is required!"
      );
    }

    //checking email isn't empty
    if (email === undefined || email === "") {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Email is required!"
      );
    }

    //checking email is valid or
    if (!isValidEmail(email)) {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Please provide your valid email!"
      );
    }

    //checking password isn't empty
    if (password === undefined) {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Password is required!"
      );
    }

    //checking password length at least 6 or not
    if (password.length < 6) {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Password must be at least 6 characters"
      );
    }

    //checking phone isn't empty
    if (phone === undefined || phone === "") {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Phone Number is required!"
      );
    }

    //checking role isn't empty
    if (role === undefined) {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Role is required!"
      );
    }

    //checking role include on system roles or not
    if (!roles.includes(role)) {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Role must be admin or customer"
      );
    }

    try {
      //checking email already exist or not
      const isEmailExists = await authService.isEmailExist(email);
      if (isEmailExists) {
        return SendError(
          res,
          400,
          false,
          "Validation failed",
          "Email already exist!!"
        );
      }

      const result: any = await authService.Signup(req.body);
      SendSuccess(
        res,
        201,
        true,
        "User registered successfully",
        result.rows[0]
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
      "Please provide your name, email, password, phone and role."
    );
  }
};

const Signin = async (req: Request, res: Response) => {
  //checking req.body is not empty.
  if (req.body !== undefined) {
    const { email, password } = req.body;

    //checking email isn't empty
    if (email === undefined) {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Email is required!"
      );
    }
    //checking email is valid or not
    if (!isValidEmail(email)) {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Please provide your valid email!"
      );
    }
    //checking password isn't empty
    if (password === undefined || password === "") {
      return SendError(
        res,
        400,
        false,
        "Validation failed",
        "Password is required!"
      );
    }

    try {
      //checking email exist or not
      const isEmailExists = await authService.isEmailExist(email);

      //checking email and password are correct or not
      const userPassword: string = await authService.getPasswordByEmail(email);
      const isPasswordExist = await bcrypt.compare(password, userPassword);
      if (!isEmailExists || !isPasswordExist) {
        return SendError(
          res,
          400,
          false,
          "Invalid Credentials!!",
          "Please check your email and password are correct."
        );
      }

      const result: any = await authService.Signin(email);
      SendSuccess(res, 200, true, "Login successful", result);
    } catch (error: any) {
      SendError(res, 500, false, "Internal Server Error", error.message);
    }
  } else {
    return SendError(
      res,
      400,
      false,
      "Validation failed",
      "Please provide email and password!"
    );
  }
};

export const authController = { Signin, Signup };
