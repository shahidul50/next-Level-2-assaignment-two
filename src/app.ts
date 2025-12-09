import express, { Request, Response } from "express";
import initDB from "./config/db";
import { authRoutes } from "./modules/auth/auth.routes";
import { userRoutes } from "./modules/user/user.routes";
import { vehicleRoutes } from "./modules/vehicle/vehicle.routes";
import { bookingRoutes } from "./modules/booking/booking.routes";

export const app = express();

//parsed
app.use(express.json());

//db initialize
initDB();

//root route
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Welcome to daily vehicle rental application.");
});

//health route
app.get("/api/v1", (req: Request, res: Response) => {
  res.status(200).send("Health status ok.");
});

//auth route
app.use("/api/v1/auth", authRoutes);

//users route
app.use("/api/v1/users", userRoutes);

//vehicles route
app.use("/api/v1/vehicles", vehicleRoutes);

//bookings route
app.use("/api/v1/bookings", bookingRoutes);

//Not found route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});
