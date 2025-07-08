import { supabase } from "@/config/supabase";

/**
 * Database representation of a product
 */
export interface DatabaseProduct {
	id: string;
	user_id: string;
	name: string;
	category: string;
	expiry_date: string;
	quantity: number;
	notes?: string;
	image_url?: string;
	created_at: string;
	updated_at: string;
	days_left?: number; // From the view
}

/**
 * Frontend representation of a product (matches your existing interface)
 */
export interface ProductItem {
	id: string;
	name: string;
	category: string;
	expiryDate: string;
	daysLeft: number;
	imageUrl?: string;
	quantity?: number;
	notes?: string;
}

/**
 * Input type for creating a new product
 */
export interface CreateProductInput {
	name: string;
	category: string;
	expiryDate: string;
	quantity?: number;
	notes?: string;
	imageUrl?: string;
}

/**
 * Input type for updating a product
 */
export interface UpdateProductInput {
	name?: string;
	category?: string;
	expiryDate?: string;
	quantity?: number;
	notes?: string;
	imageUrl?: string;
}

/**
 * Transform database product to frontend format
 */
export function transformDatabaseProductToFrontend(
	dbProduct: DatabaseProduct,
): ProductItem {
	return {
		id: dbProduct.id,
		name: dbProduct.name,
		category: dbProduct.category,
		expiryDate: dbProduct.expiry_date,
		daysLeft: dbProduct.days_left || 0,
		imageUrl: dbProduct.image_url,
		quantity: dbProduct.quantity,
		notes: dbProduct.notes,
	};
}

/**
 * Product service class with all CRUD operations
 */
export class ProductService {
	/**
	 * Get all products for the current user
	 */
	static async getProducts(): Promise<ProductItem[]> {
		try {
			const { data, error } = await supabase
				.from("products_with_days_left")
				.select("*")
				.order("expiry_date", { ascending: true });

			if (error) {
				console.error("Error fetching products:", error);
				throw new Error(`Failed to fetch products: ${error.message}`);
			}

			return data?.map(transformDatabaseProductToFrontend) || [];
		} catch (error) {
			console.error("Error in getProducts:", error);
			throw error;
		}
	}

	/**
	 * Get products by category
	 */
	static async getProductsByCategory(category: string): Promise<ProductItem[]> {
		try {
			const { data, error } = await supabase
				.from("products_with_days_left")
				.select("*")
				.eq("category", category)
				.order("expiry_date", { ascending: true });

			if (error) {
				console.error("Error fetching products by category:", error);
				throw new Error(`Failed to fetch products: ${error.message}`);
			}

			return data?.map(transformDatabaseProductToFrontend) || [];
		} catch (error) {
			console.error("Error in getProductsByCategory:", error);
			throw error;
		}
	}

	/**
	 * Get products expiring soon (within specified days)
	 */
	static async getExpiringSoonProducts(
		withinDays: number = 3,
	): Promise<ProductItem[]> {
		try {
			const { data, error } = await supabase
				.from("products_with_days_left")
				.select("*")
				.lte("days_left", withinDays)
				.order("expiry_date", { ascending: true });

			if (error) {
				console.error("Error fetching expiring products:", error);
				throw new Error(`Failed to fetch expiring products: ${error.message}`);
			}

			return data?.map(transformDatabaseProductToFrontend) || [];
		} catch (error) {
			console.error("Error in getExpiringSoonProducts:", error);
			throw error;
		}
	}

	/**
	 * Create a new product
	 */
	static async createProduct(
		productData: CreateProductInput,
	): Promise<ProductItem> {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				throw new Error("User not authenticated");
			}

			const { data, error } = await supabase
				.from("products")
				.insert({
					user_id: user.id,
					name: productData.name,
					category: productData.category,
					expiry_date: productData.expiryDate,
					quantity: productData.quantity || 1,
					notes: productData.notes,
					image_url: productData.imageUrl,
				})
				.select()
				.single();

			if (error) {
				console.error("Error creating product:", error);
				throw new Error(`Failed to create product: ${error.message}`);
			}

			// Calculate days_left manually for the response
			const expiryDate = new Date(data.expiry_date);
			const today = new Date();
			const daysLeft = Math.ceil(
				(expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
			);

			return transformDatabaseProductToFrontend({
				...data,
				days_left: daysLeft,
			});
		} catch (error) {
			console.error("Error in createProduct:", error);
			throw error;
		}
	}

	/**
	 * Update an existing product
	 */
	static async updateProduct(
		productId: string,
		updates: UpdateProductInput,
	): Promise<ProductItem> {
		try {
			const updateData: any = {};

			if (updates.name !== undefined) updateData.name = updates.name;
			if (updates.category !== undefined)
				updateData.category = updates.category;
			if (updates.expiryDate !== undefined)
				updateData.expiry_date = updates.expiryDate;
			if (updates.quantity !== undefined)
				updateData.quantity = updates.quantity;
			if (updates.notes !== undefined) updateData.notes = updates.notes;
			if (updates.imageUrl !== undefined)
				updateData.image_url = updates.imageUrl;

			const { data, error } = await supabase
				.from("products")
				.update(updateData)
				.eq("id", productId)
				.select()
				.single();

			if (error) {
				console.error("Error updating product:", error);
				throw new Error(`Failed to update product: ${error.message}`);
			}

			// Calculate days_left manually for the response
			const expiryDate = new Date(data.expiry_date);
			const today = new Date();
			const daysLeft = Math.ceil(
				(expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
			);

			return transformDatabaseProductToFrontend({
				...data,
				days_left: daysLeft,
			});
		} catch (error) {
			console.error("Error in updateProduct:", error);
			throw error;
		}
	}

	/**
	 * Delete a product
	 */
	static async deleteProduct(productId: string): Promise<void> {
		try {
			const { error } = await supabase
				.from("products")
				.delete()
				.eq("id", productId);

			if (error) {
				console.error("Error deleting product:", error);
				throw new Error(`Failed to delete product: ${error.message}`);
			}
		} catch (error) {
			console.error("Error in deleteProduct:", error);
			throw error;
		}
	}

	/**
	 * Search products by name or category
	 */
	static async searchProducts(query: string): Promise<ProductItem[]> {
		try {
			const { data, error } = await supabase
				.from("products_with_days_left")
				.select("*")
				.or(`name.ilike.%${query}%,category.ilike.%${query}%`)
				.order("expiry_date", { ascending: true });

			if (error) {
				console.error("Error searching products:", error);
				throw new Error(`Failed to search products: ${error.message}`);
			}

			return data?.map(transformDatabaseProductToFrontend) || [];
		} catch (error) {
			console.error("Error in searchProducts:", error);
			throw error;
		}
	}

	/**
	 * Get unique categories used by the user
	 */
	static async getCategories(): Promise<string[]> {
		try {
			const { data, error } = await supabase
				.from("products")
				.select("category")
				.order("category");

			if (error) {
				console.error("Error fetching categories:", error);
				throw new Error(`Failed to fetch categories: ${error.message}`);
			}

			// Extract unique categories
			const uniqueCategories = [
				...new Set(data?.map((item) => item.category) || []),
			];
			return uniqueCategories;
		} catch (error) {
			console.error("Error in getCategories:", error);
			throw error;
		}
	}
}
