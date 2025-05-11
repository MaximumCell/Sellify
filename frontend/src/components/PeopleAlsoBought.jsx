import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import axiosInstance from "../libs/axios";
import LoadingSpinner from "./LoadingSpinner";

const PeopleAlsoBought = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const res = await axiosInstance.get("/products/recommended");
                setRecommendations(res.data.products);
            } catch (error) {
                console.error("Error fetching recommendations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendations();
    }, []);
    if (loading) {
        return (
            <LoadingSpinner />
        );
    }
  return (
    <div className="mt-8">
      <h3 className="text-2xl font-semibold text-emerald-400">People Also Bought</h3>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((product) => (
            <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default PeopleAlsoBought;
