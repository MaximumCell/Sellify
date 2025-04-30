import Product from "../models/product.model.js";
import User from "../models/user.model.js";


export const analyticsController = async (req, res) => {
    try {
        const analyticsData = await getAnalyticsData();
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000 * 7); // 7 days ago
        const dailySalesData = await getDailySalesData(startDate, endDate);

        res.status(200).json({
            success: true,
            message: "Analytics data fetched successfully",
            data: {
                analyticsData,
                dailySalesData,
            },
        });

    } catch (error) {
        console.error("Error fetching analytics data:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch analytics data",
            error: error.message,
        });
    }
};

const getAnalyticsData = async () => {
    const totalUsers = await User.countDocuments({});
    const totalProducts = await Product.countDocuments({});

    const salesData = await Product.aggregate([
        {
            $group: {
                _id: null,
                totalSales: { $sum:1 },
                totalRevenue: { $sum: { $multiply: ["$totalAmount"] } }
            }
        }
    ]);
    const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

    return {
        user: totalUsers,
        product: totalProducts,
        sales: totalSales,
        revenue: totalRevenue,
    };
}

const getDailySalesData = async (startDate, endDate) => {
    const dailySalesData = await Product.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lt: endDate,
                },
            },
        },
       {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt"} },
                sales: { $sum: 1 },
                revenue: { $sum: "$totalAmount" },
            },
       },
        {
            $sort: { _id: 1 },
        },
    ]);
    const dateArray = getDatesInRange(startDate, endDate);

    return dateArray.map((date) => {
        const salesData = dailySalesData.find((data) => data._id === date);
        return {
            date,
            sales: salesData ? salesData.sales : 0,
            revenue: salesData ? salesData.revenue : 0,
        };
    });
}

function getDatesInRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
  
    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return dates;
  }