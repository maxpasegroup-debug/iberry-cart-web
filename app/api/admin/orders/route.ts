import { NextRequest } from "next/server";
import { requireAdminApiUser } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import OrderModel from "@/models/Order";

export async function GET() {
  const admin = await requireAdminApiUser();
  if (!admin) return errorResponse("Unauthorized", 401);

  try {
    await connectToDatabase();
    const orders = await OrderModel.find({}).sort({ createdAt: -1 }).lean();
    return successResponse(orders);
  } catch (error) {
    return errorResponse("Failed to fetch orders", 500, String(error));
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdminApiUser();
  if (!admin) return errorResponse("Unauthorized", 401);

  try {
    await connectToDatabase();
    const body = await req.json();
    const orderId = body.orderId as string;
    const status = body.status as string;

    if (!orderId || !status) return errorResponse("Missing orderId or status", 400);

    const order = await OrderModel.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) return errorResponse("Order not found", 404);
    return successResponse(order, "Order updated");
  } catch (error) {
    return errorResponse("Failed to update order", 500, String(error));
  }
}
