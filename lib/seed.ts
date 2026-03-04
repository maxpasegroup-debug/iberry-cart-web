import CategoryModel from "@/models/Category";
import ProductModel from "@/models/Product";
import { seedCategories, seedProducts } from "@/lib/mock-data";

export async function ensureSeedData() {
  const productCount = await ProductModel.countDocuments();
  if (productCount > 0) return;

  const createdCategories = await CategoryModel.insertMany(seedCategories);
  const categoryMap = new Map(
    createdCategories.map((cat) => [cat.slug, cat._id]),
  );

  await ProductModel.insertMany(
    seedProducts.map((product) => ({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice,
      stock: product.stock,
      image: product.image,
      category: categoryMap.get(product.categorySlug),
      featured: product.featured,
      rating: product.rating,
    })),
  );
}
