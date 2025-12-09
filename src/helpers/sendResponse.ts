import { Response } from "express";

export const SendSuccess = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: {}
) => {
  res.status(statusCode).send({
    success: success,
    message: message,
    data: data,
  });
};

export const SendError = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  errors?: {}
) => {
  res.status(statusCode).send({
    success: success,
    message: message,
    errors: errors,
  });
};
