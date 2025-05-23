import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import cors from "cors";
import path from "path";

import { connectDB } from "./libs/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

app.use(express.json({limit: "10mb"}));
app.use(cookieParser());
const allowedOrigin = process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : "http://localhost:5173";
const corsOptions = {
  origin: allowedOrigin, // Set the origin dynamically
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
};
console.log(`CORS allowing origin: ${allowedOrigin}`);

app.use(cors(corsOptions));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

if(process.env.NODE_ENV === "production") {const staticPath = path.join(__dirname, "/frontend/dist");
  console.log("Serving static files from:", staticPath);
  app.use(express.static(staticPath));

  // Change the fallback route to use a regex pattern
  const fallbackPattern = /^(.*)$/; // This regex matches any path
  console.log("Registering fallback route with pattern:", fallbackPattern);
  app.get(fallbackPattern, (req, res) => {
    const indexPath = path.resolve(__dirname, "frontend", "dist", "index.html");
    console.log("Sending index.html from:", indexPath);
    res.sendFile(indexPath);
  });

  console.log("Production static and fallback routes registered.");
}

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
  connectDB();
});
