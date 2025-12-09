import { Router } from "express";
import { bookingController } from "./booking.controller";
import auth from "../../middleware/auth";

const router = Router();

//get all booking route
router.get("/", auth("admin", "customer"), bookingController.getAllBooking);

//create booking route
router.post("/", auth("admin", "customer"), bookingController.createBooking);

//update booking route
router.put(
  "/:bookingId",
  auth("admin", "customer"),
  bookingController.updateBooking
);

export const bookingRoutes = router;
