import { Router } from "express";
import { vehicleController } from "./vehicle.controller";
import auth from "../../middleware/auth";

const router = Router();

//get all vehicle route
router.get("/", vehicleController.getAllVehicle);

//create vehicle route
router.post("/", auth("admin"), vehicleController.createVehicle);

//get single vehicle route
router.get("/:vehicleId", vehicleController.getVehicleById);

//update vehicle route
router.put("/:vehicleId", auth("admin"), vehicleController.updateVehicle);

//delete vehicle route
router.delete("/:vehicleId", auth("admin"), vehicleController.deleteVehicle);

export const vehicleRoutes = router;
