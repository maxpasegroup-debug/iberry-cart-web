import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import { cartItemSchema, cartPatchSchema } from "@/lib/validation";
import { getOrCreateSessionId } from "@/lib/session";
import CartModel from "@/models/Cart";
import ProductModel from "@/models/Product";
import { calculateCartTotals } from "@/lib/cart";

async function getCartWithTotals(sessionId: string) {
  const cart = await CartModel.findOne({ sessionId }).populate({
    path: "items.product",
    select: "name slug image price discountPrice stock",
  });

  if (!cart) {
    return {
      cart: null,
      totals: calculateCartTotals([]),
    };
  }

  const lines = cart.items
    .map((item) => {
      const product = item.product as unknown as {
        price: number;
        discountPrice?: number | null;
      } | null;
      if (!product) return null;
      return {
        quantity: item.quantity,
        price: product.price,
        discountPrice: product.discountPrice,
      };
    })
    .filter(Boolean) as { quantity: number; price: number; discountPrice?: number | null }[];

  return {
    cart,
    totals: calculateCartTotals(lines),
  };
}

export async function GET() {
  try {
    await connectToDatabase();
    const sessionId = await getOrCreateSessionId();
    const data = await getCartWithTotals(sessionId);
    return successResponse(data);
  } catch (error) {
    return errorResponse("Failed to fetch cart", 500, String(error));
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = cartItemSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid cart payload", 400, parsed.error.flatten());
    }

    const sessionId = await getOrCreateSessionId();
    const { productId, quantity } = parsed.data;
    const product = await ProductModel.findById(productId);

    if (!product) return errorResponse("Product not found", 404);
    if (product.stock < quantity) return errorResponse("Not enough stock", 400);

    const cart =
      (await CartModel.findOne({ sessionId })) ??
      (await CartModel.create({ sessionId, items: [] }));

    const existingItem = cart.items.find((item) => String(item.product) === String(product._id));
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: product._id, quantity });
    }
    await cart.save();

    const data = await getCartWithTotals(sessionId);
    return successResponse(data, "Item added to cart", 201);
  } catch (error) {
    return errorResponse("Failed to add item to cart", 500, String(error));
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = cartPatchSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid cart patch payload", 400, parsed.error.flatten());
    }

    const sessionId = await getOrCreateSessionId();
    const { itemId, quantity } = parsed.data;
    const cart = await CartModel.findOne({ sessionId });

    if (!cart) return errorResponse("Cart not found", 404);
    const item = cart.items.id(itemId);
    if (!item) return errorResponse("Cart item not found", 404);

    if (quantity === 0) {
      item.deleteOne();
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    const data = await getCartWithTotals(sessionId);
    return successResponse(data, "Cart updated");
  } catch (error) {
    return errorResponse("Failed to update cart", 500, String(error));
  }
}
