import {stripe} from "../libs/stripe.js";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
export const createCheckoutSession = async (req, res) => {
    try {
        const { products, couponCode } = req.body;
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: "Invalid or empty products array" });
        }
        let totalAmount = 0;
        const lineItems = products.map(product => {
            const amount = Math.round(product.price * 100); // Convert to cents for Stripe
            totalAmount += amount * product.quantity;
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        images: [product.image],
                    },
                    unit_amount: amount,
                },
                quantity: product.quantity,
            };
        });
        let coupon = null;
        if (couponCode) {
            coupon = await Coupon.findOne({ code: couponCode, isActive: true,userId: req.user._id });
            if (coupon) {
                totalAmount -= Math.round((totalAmount * coupon.discount) / 100); // Apply discount
                if (totalAmount < 0) {
                    totalAmount = 0; // Ensure total amount doesn't go negative
                }
            } 
            const session =  stripe.checkout.sessions.create({
                payment_method_types:["card"],
                line_items: lineItems,
                mode: "payment",
                success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CLIENT_URL}/purchase-cancel?session_id={CHECKOUT_SESSION_ID}`,
                discounts: coupon ? [{ coupon: await createStripeCoupon(coupon.discountPercentage) }] : [],
                metadata: {
                    userId: req.user._id.toString(),
                    couponCode: couponCode || "",
                    products: JSON.stringify(products.map((p) => ({ id: p._id, quantity: p.quantity, price: p.price }))),
                },
            });
            if (totalAmount >= 20000) {
                await createNewCoupon(req.user._id);
            }
            res.status(200).json({ sessionId: session.id, totalAmount: totalAmount/100 });
        }
    } catch (error) {
        console.error("Error creating checkout session:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const checkoutSuccess = async (req, res) => {
    try {
        const { session_id } = req.body;
        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status === "paid") {
            if (session.metadata.couponCode) {
                const coupon = await Coupon.findByIdAndUpdate({
                    code: session.metadata.couponCode,
                    userId: session.metadata.userId,
                }, { isActive: false });
                res.status(200).json({ session });
            }
        } else {
            res.status(404).json({ message: "Session not found" });
        }
        const products = JSON.parse(session.metadata.products);
        const newOrder = new Order({
            user: session.metadata.userId,
            products: products.map((p) => ({ id: p.id, quantity: p.quantity, price: p.price })),
            totalAmount: session.amount_total / 100,
            stripeSessionId: session.id,
        })
        await newOrder.save();
        res.status(200).json({ success: true, 
            message: "Order created successfully",
            order: newOrder,
         });
    } catch (error) {
        console.error("Error retrieving checkout session:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
async function createStripeCoupon(discountPercentage) {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: 'once',
    });
    return coupon.id;
}

async function createNewCoupon(userId){
    const newCoupon = new Coupon({
        code:"GIFT"+Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        userId: userId,
        isActive: true,
    })
    await newCoupon.save();
    return newCoupon;
}