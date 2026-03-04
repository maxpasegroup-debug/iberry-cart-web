import { requireAdminApiUser } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import ProductModel from "@/models/Product";
import OrderModel from "@/models/Order";
import VendorModel from "@/models/Vendor";
import CategoryModel from "@/models/Category";

export async function GET() {
  const admin = await requireAdminApiUser();
  if (!admin) return errorResponse("Unauthorized", 401);

  try {
    await connectToDatabase();

    const [productCount, orderCount, vendorCount, categoryCount, paidOrders, lowStock] =
      await Promise.all([
        ProductModel.countDocuments(),
        OrderModel.countDocuments(),
        VendorModel.countDocuments(),
        CategoryModel.countDocuments(),
        OrderModel.find({ paymentStatus: "paid" }).select("total").lean(),
        ProductModel.find({ stock: { $lte: 10 } })
          .select("name stock")
          .sort({ stock: 1 })
          .limit(8)
          .lean(),
      ]);

    const grossRevenue = paidOrders.reduce((acc, order) => acc + (order.total ?? 0), 0);

    const statusAgg = await OrderModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    return successResponse({
      kpis: {
        productCount,
        orderCount,
        vendorCount,
        categoryCount,
        grossRevenue,
      },
      orderStatus: statusAgg,
      lowStock,
    });
  } catch (error) {
    return errorResponse("Failed to fetch admin overview", 500, String(error));
  }
}
