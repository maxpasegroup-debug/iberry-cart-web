import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import OrderModel from "@/models/Order";
import { getOrCreateSessionId } from "@/lib/session";
import { getAuthUserFromCookie } from "@/lib/auth";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const sessionId = await getOrCreateSessionId();
    const authUser = await getAuthUserFromCookie();

    // Orders are created for the current cart session; if a user was authenticated,
    // we also store `order.user` for broader access.
    const order = await OrderModel.findOne({
      _id: id,
      $or: [
        { sessionId },
        ...(authUser?.userId ? [{ user: authUser.userId }] : []),
      ],
    }).lean();
    if (!order) return errorResponse("Order not found", 404);
    return successResponse(JSON.parse(JSON.stringify(order)));
  } catch (error) {
    return errorResponse("Failed to fetch order", 500, String(error));
  }
}
