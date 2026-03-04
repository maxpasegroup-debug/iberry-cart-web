export const seedCategories = [
  { name: "Tea", slug: "tea", image: "" },
  { name: "Coffee", slug: "coffee", image: "" },
  { name: "Honey", slug: "honey", image: "" },
  { name: "Spices", slug: "spices", image: "" },
  { name: "Herbal Powders", slug: "herbal-powders", image: "" },
  { name: "Superfoods", slug: "superfoods", image: "" },
];

export const seedProducts = [
  {
    name: "Organic Green Tea",
    slug: "organic-green-tea",
    description: "Fresh and antioxidant-rich green tea leaves.",
    price: 249,
    discountPrice: 219,
    stock: 120,
    image:
      "https://images.unsplash.com/photo-1542444459-db63c88c53f1?auto=format&fit=crop&w=800&q=80",
    categorySlug: "tea",
    featured: true,
    rating: 4.6,
  },
  {
    name: "Kerala Filter Coffee",
    slug: "kerala-filter-coffee",
    description: "Authentic south Indian filter coffee powder blend.",
    price: 299,
    discountPrice: 269,
    stock: 95,
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    categorySlug: "coffee",
    featured: true,
    rating: 4.7,
  },
  {
    name: "Raw Forest Honey",
    slug: "raw-forest-honey",
    description: "Unprocessed raw forest honey sourced responsibly.",
    price: 349,
    discountPrice: 319,
    stock: 88,
    image:
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80",
    categorySlug: "honey",
    featured: true,
    rating: 4.8,
  },
  {
    name: "Premium Cardamom",
    slug: "premium-cardamom",
    description: "Aromatic premium-grade cardamom pods.",
    price: 399,
    discountPrice: 359,
    stock: 55,
    image:
      "https://images.unsplash.com/photo-1620894589938-4f6f5d4f7fdb?auto=format&fit=crop&w=800&q=80",
    categorySlug: "spices",
    featured: false,
    rating: 4.5,
  },
  {
    name: "Turmeric Powder",
    slug: "turmeric-powder",
    description: "Natural turmeric powder with rich curcumin content.",
    price: 179,
    discountPrice: 159,
    stock: 150,
    image:
      "https://images.unsplash.com/photo-1615486363976-f79c8f3fd0de?auto=format&fit=crop&w=800&q=80",
    categorySlug: "spices",
    featured: false,
    rating: 4.4,
  },
  {
    name: "Herbal Ashwagandha",
    slug: "herbal-ashwagandha",
    description: "Premium ashwagandha powder for daily wellness.",
    price: 329,
    discountPrice: 299,
    stock: 65,
    image:
      "https://images.unsplash.com/photo-1617641915894-9b2365f1a8a5?auto=format&fit=crop&w=800&q=80",
    categorySlug: "herbal-powders",
    featured: false,
    rating: 4.6,
  },
];
