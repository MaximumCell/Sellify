import { create } from "zustand";
import axios from "../libs/axios";
import toast from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  total: 0,
  subtotal: 0,
  loading: false,
  error: null,
  coupon: null,
  isCouponApplied: false,
  getCartItems: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/cart");
      set({ cart: response.data, loading: false });
      get().calculateTotals();
    } catch (error) {
      set({ error: error.message, loading: false, cart: [] });
    }
  },
  addToCart: async (productId) => {
    set({ loading: true });
    try {
      const response = await axios.post("/cart", { productId: productId._id });
      //   console.log("response", response);
      set((prevState) => {
        const existingProduct = prevState.cart.find(
          (item) => item._id === productId._id
        );
        const newCart = existingProduct
          ? prevState.cart.map((item) =>
              item._id === productId._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [...prevState.cart, { ...productId, quantity: 1 }];
        return { ...prevState, cart: newCart };
      });
      get().calculateTotals();
      //   toast.success("Added to cart successfully");
    } catch (error) {
      set({ error: error.message, loading: false, cart: [] });
      toast.error(error.response.data.message || "Failed to add to cart");
    } finally {
      set({ loading: false });
    }
  },
  calculateTotals: () => {
    const { cart, coupon } = get();
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    let total = subtotal;
    if (coupon) {
      const discount = subtotal * (coupon.discountPercentage / 100);
      total = subtotal - discount;
    }
    set({ subtotal, total });
  },
  removeFromCart: async (productId) => {
    set({ loading: true });
    try {
      await axios.delete("/cart", {
        data: { productId },
      });
      set((prevState) => ({
        cart: prevState.cart.filter((item) => item._id !== productId),
      }));
      get().calculateTotals();
      toast.success("Removed from cart successfully");
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(error.response.data.message || "Failed to remove from cart");
    } finally {
      set({ loading: false });
    }
  },
  updateQuantity: async (productId, quantity) => {
    if (quantity === 0) {
      get().removeFromCart(productId);
      return;
    }

    await axios.put(`/cart/${productId}`, { quantity });
    set((prevState) => ({
      cart: prevState.cart.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      ),
    }));
    get().calculateTotals();
  },
  clearCart: async () => {
    set({ cart: [], coupon: null, total: 0, subtotal: 0 });
  },
  applyCoupon: async (code) => {
    set({ loading: true });
    try {
      const response = await axios.post("/coupons/validate", { code });
      console.log("response", response);
      set({ coupon: response.data, isCouponApplied: true });
      get().calculateTotals();
      toast.success("Coupon applied successfully");
      console.log("Coupon applied successfully", response.data);
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(error.response.data.message || "Failed to apply coupon");
    } finally {
      set({ loading: false });
    }
  },
  removeCoupon: () => {
    set({ coupon: null, isCouponApplied: false });
    get().calculateTotals();
    toast.success("Coupon removed successfully");
  },
  getMyCoupons: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/coupons");
      console.log("response", response);
      set({ coupon: response.data.coupons, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));
