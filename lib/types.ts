export type Category = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  image: string;
  featured?: boolean;
  rating?: number;
  category?: Category;
  brand?: {
    _id: string;
    name: string;
    type: "own" | "partner" | "dropshipping";
  };
};

export type CartResponse = {
  cart: {
    _id: string;
    items: Array<{
      _id: string;
      product: Product;
      quantity: number;
    }>;
  } | null;
  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
  };
};
