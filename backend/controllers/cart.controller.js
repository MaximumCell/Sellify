import Product from "../models/product.model.js";

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    const existingCart = await Cart.find((item) => item.id === productId);
    if (existingCart) {
      existingCart.quantity += 1;
    } else {
        user.cartItem.push({
          productId: productId,
          quantity: 1,
        });
    }
    await user.save();
    res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
        cart: user.cartItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const removeAllFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;
        if (!productId) {
            user.cartItem = [];
        } else {
            user.cartItem = user.cartItem.filter((item) => item.productId !== productId);
        }
        await user.save();
        res.status(200).json({
            success: true,
            message: "Product removed from cart successfully",
            cart: user.cartItem,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const updateQuantity = async (req, res) => {
    try {
        const { id:productId } = req.params;
        const { quantity } = req.body;
        const user = req.user;
        const existingCart = user.cartItem.find((item) => item.productId === productId);
        if (existingCart) {
            if (quantity === 0) {
                user.cartItem = user.cartItem.filter((item) => item.productId !== productId);
                return res.status(200).json({
                    success: true,
                    message: "Product removed from cart successfully",
                    cart: user.cartItem,
                });
            }
            existingCart.quantity = quantity;
                await user.save();
                res.status(200).json({
                    success: true,
                    message: "Product quantity updated successfully",
                    cart: user.cartItem,
            }); 
        } else {
            res.status(400).json({
                success: false,
                message: "Product not found in cart",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const getCartProducts = async (req, res) => {
    try {
        const products = await Product.find({_id:{$in:req.user.cartItem}});
        // calculate the cart items with quantity
        const cartItems = products.map(product => {
            const item = req.user.cartItem.find(item => item.productId.toString() === product._id.toString());
            return { ...product.toJSON(), quantity: item ? item.quantity : 0 };
        });
        res.status(200).json({
            success: true,
            message: "Cart products fetched successfully",
            cart: cartItems,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
