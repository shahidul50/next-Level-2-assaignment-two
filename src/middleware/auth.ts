import { NextFunction, Request, Response } from "express";
import { SendError } from "../helpers/sendResponse";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";

const auth = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return SendError(
          res,
          401,
          false,
          "Unauthorized: Token missing",
          "Authorization header required"
        );
      }

      const tokenArray: string[] = authHeader!.split(" ");

      if (tokenArray.length !== 2 || tokenArray[0] !== "Bearer") {
        return SendError(
          res,
          401,
          false,
          "Invalid authorization format",
          "Expected format: Bearer <token>"
        );
      }

      const token = tokenArray[1];

      const decodedToken = jwt.verify(
        token!,
        config.jwtSecret as string
      ) as JwtPayload;
      //   console.log("Decoded Token: ", decodedToken);

      req.user = decodedToken;

      if (roles.length && !roles.includes(decodedToken.role as string)) {
        return SendError(
          res,
          403,
          false,
          "Forbidden",
          "Sorry, you don't have permission to access this resource"
        );
      }
      next();
    } catch (error: any) {
      SendError(res, 500, false, "Internal Server Error", error.message);
    }
  };
};

export default auth;
