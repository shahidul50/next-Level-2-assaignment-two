import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

//register route
router.post("/signup", authController.Signup);
//login route
router.post("/signin", authController.Signin);

export const authRoutes = router;
