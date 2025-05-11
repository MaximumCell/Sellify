import { create } from "zustand";
import axios from "../libs/axios";
import toast from "react-hot-toast";

const useProductStore = create((set) => ({
  products: [],
  loading: false,
  deleteLoading: false,
  setProducts: (products) => set({ products }),
  createProduct: async (productData) => {
    set({ loading: true });
    try {
      const response = await axios.post("/products", productData);
      set((state) => ({
        products: [...state.products, response.data],
        loading: false,
      }));
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Error creating product. Please try again.");
      set({ loading: false });
    }
  },
  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/products");
      // console.log(res.data.products);
      set({ products: res.data.products, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(
        error.message || "Error fetching products. Please try again."
      );
    }
  },
  deleteProduct: async (productId) => {
    set({ deleteLoading: true });
    try {
      await axios.delete(`/products/${productId}`);
      // remove the product from the store
      set((state) => ({
        products: state.products.filter((product) => product._id !== productId),
        deleteLoading: false,
      }));
      toast.success("Product deleted successfully.");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error deleting product. Please try again.");
      set({ deleteLoading: false });
    }
  },
  toggleFeaturedProduct: async (productId) => {
    set({ loading: true });
    try {
      const response = await axios.patch(`/products/${productId}`);
      // this will update the isFeatured prop of the product
      set((prevProducts) => ({
        products: prevProducts.products.map((product) =>
          product._id === productId
            ? { ...product, isFeatured: response.data.product.isFeatured }
            : product
        ),
        loading: false,
      }));
      // console.log("in toggle function",response.data);
      toast.success("Product updated successfully.");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.error || "Failed to update product");
    }
  },
  fetchProductsByCategory: async (category) => {
    set({ loading: true });
    try {
      const res = await axios.get(`/products/category/${category}`);
      set({ products: res.data.products, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(
        error.message || "Error fetching products. Please try again."
      );
    }
  },
  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/products/featured");
      console.log("featured products", res.data);
      set({ products: res.data.products, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(
        error.message || "Error fetching products. Please try again."
      );
    }
  },
}));

export default useProductStore;
