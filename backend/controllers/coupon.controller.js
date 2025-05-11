import Coupon from "../models/coupon.model.js";

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });
    res.status(200).json({
      success: true,
      coupons: coupons ? coupons : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({code:code, userId: req.user._id, isActive: true});
        if (!coupon) {
            return res.status(400).json({
                success: false,
                message: "Coupon not found",
            });
        }
        if (coupon.expirationDate < new Date()){
            coupon.isActive = false;
            await coupon.save();
            return res.status(400).json({
                success: false,
                message: "Coupon expired",
            });
        }
        res.status(200).json({
            success: true,
            message: "Coupon is valid",
            coupon: coupon.code,
            discountPercentage: coupon.discountPercentage,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};