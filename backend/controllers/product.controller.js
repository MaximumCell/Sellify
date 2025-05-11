import product from "../models/product.model.js";
import { redis } from "../libs/redis.js";
import cloudinary from "../libs/cloudinary.js";
import Product from "../models/product.model.js";
export const getAllProducts = async (req, res) => {
  try {
    const products = await product.find({});
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await redis.get("featuredProducts");
    if (featuredProducts) {
      return res.status(200).json({
        success: true,
        message: "Featured products fetched successfully",
        products: JSON.parse(featuredProducts),
      });
    }
    // .lean() is used to convert the mongoose document to a plain javascript object
    featuredProducts = await product.find({ isFeatured: true }).lean();
    if (!featuredProducts) {
      return res.status(404).json({
        success: false,
        message: "No featured products found",
      });
    }
    await redis.set("featuredProducts", JSON.stringify(featuredProducts));

    res.status(200).json({
      success: true,
      message: "Featured products fetched successfully",
      products: featuredProducts,
    });
  } catch (error) {
    console.error("Error in getFeaturedProduct", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    let cloudinaryResponse = null;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }
    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
      category,
    });

    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product creation failed",
      });
    }
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error in createProduct", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`); // delete image from cloudinary
        console.log("Image deleted from cloudinary successfully");
      } catch (error) {
        console.error("Error in deleting image from cloudinary", error.message);
      }
    }
    await Product.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteProduct", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $sample: { size: 4 } }, // get 4 random products
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          image: 1,
          category: 1,
        },
      },
    ]);
    if (!products) {
      return res.status(404).json({
        success: false,
        message: "No recommended products found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Recommended products fetched successfully",
      products,
    });
  } catch (error) {
    console.error("Error in getRecommendedProducts", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getProductsByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const products = await Product.find({ category });
        if (!products) {
            return res.status(404).json({
                success: false,
                message: "No products found in this category",
            });
        }
        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            products,
        });
    } catch (error) {
        console.error("Error in getProductsByCategory", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

export const toggleFeaturedProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) {
            res.status(401).json({
                success: false,
                message: "Product not found",
            });
        }
        product.isFeatured = !product.isFeatured;
        const updatedProduct = await product.save();
        await updateFeaturedProductsCache(); // update the cache after toggling the featured product
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct,
        });
    } catch (error) {
        console.error("Error in toggleFeaturedProduct", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

async function updateFeaturedProductsCache() {
    try {
        const featuredProducts = await Product.find({ isFeatured: true }).lean();
        await redis.set("featuredProducts", JSON.stringify(featuredProducts));
    } catch (error) {
        console.error("Error in updating featured products cache", error.message);
        throw new Error("Failed to update featured products cache");
    }
}