import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import OrderModel from "@/models/Order";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const order = await OrderModel.findById(id).lean();
    if (!order) return errorResponse("Order not found", 404);
    return successResponse(JSON.parse(JSON.stringify(order)));
  } catch (error) {
    return errorResponse("Failed to fetch order", 500, String(error));
  }
}
