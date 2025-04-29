import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

export const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access",
            });
        }
        try {
            const decoded = jwt.verify(accessToken, process.env.ACCESS_JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access, user not found",
            });
        }
        req.user = user;
        next();
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized access, token expired",
                });
            }
            throw error;
        }
    } catch (error) {
        console.error(error);
        return res.status(401).json({
            success: false,
            message: "Unauthorized access, invalid token",
            error: error.message,
        });
    }
}

export const adminRoute = async (req, res, next) => {
    try {
        if (req.user && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Forbidden access, admin only",
            });
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(403).json({
            success: false,
            message: "Forbidden access, admin only",
            error: error.message,
        });
    }
}
