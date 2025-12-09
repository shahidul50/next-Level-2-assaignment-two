import { Router } from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";

const router = Router();

//get all user route
router.get("/", auth("admin"), userController.getAllUser);

//update user route
router.put("/:userId", auth("admin", "customer"), userController.updateUser);

//delete user route
router.delete("/:userId", auth("admin"), userController.deleteUser);

export const userRoutes = router;
