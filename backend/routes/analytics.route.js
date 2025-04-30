import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { analyticsController } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, analyticsController);

export default router;