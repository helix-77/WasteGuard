import { supabase } from "@/config/supabase";
import { ImageUploadService } from "./imageUploadService";

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
 * User statistics from database
 */
export interface UserStatistics {
	id: string;
	userId: string;
	totalProductsAdded: number;
	totalProductsUsed: number;
	totalProductsExpired: number;
	currentActiveProducts: number;
	lastActivityDate: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * User analytics with calculated fields
 */
export interface UserAnalytics {
	userId: string;
	totalProductsAdded: number;
	totalProductsUsed: number;
	totalProductsExpired: number;
	currentActiveProducts: number;
	lastActivityDate: string;
	usagePercentage: number;
	productsUsedBeforeExpiry: number;
	productsUsedAfterExpiry: number;
}

/**
 * Usage history entry
 */
export interface UsageHistoryItem {
	id: string;
	userId: string;
	productId: string;
	usageDate: string;
	daysBeforeExpiry: number;
	wasExpired: boolean;
	quantityUsed: number;
	usageNotes?: string;
	createdAt: string;
	productName: string;
	productCategory: string;
	expiryDate: string;
	productNotes?: string;
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
	 * Delete a product and its associated image from storage
	 */
	static async deleteProduct(productId: string): Promise<void> {
		try {
			// First, get the product to retrieve the image URL
			const { data: product, error: fetchError } = await supabase
				.from("products")
				.select("image_url")
				.eq("id", productId)
				.single();

			if (fetchError && fetchError.code !== "PGRST116") {
				// PGRST116 is "not found" error, which is okay for deletion
				console.error("Error fetching product for deletion:", fetchError);
				throw new Error(`Failed to fetch product: ${fetchError.message}`);
			}

			// Delete the image from storage if it exists and is a Supabase URL
			if (product?.image_url && this.isSupabaseStorageUrl(product.image_url)) {
				try {
					const imagePath = ImageUploadService.extractPathFromUrl(
						product.image_url,
					);
					await ImageUploadService.deleteImage(imagePath);
					// console.log(`✅ Deleted image from storage: ${imagePath}`);
				} catch (imageError) {
					// Log warning but don't fail the entire deletion
					console.warn("⚠️ Failed to delete image from storage:", imageError);
				}
			}

			// Delete the product from the database
			const { error: deleteError } = await supabase
				.from("products")
				.delete()
				.eq("id", productId);

			if (deleteError) {
				console.error("Error deleting product from database:", deleteError);
				throw new Error(`Failed to delete product: ${deleteError.message}`);
			}
		} catch (error) {
			console.error("Error in deleteProduct:", error);
			throw error;
		}
	}

	/**
	 * Delete multiple products and their associated images
	 * Useful for bulk operations or cleanup
	 */
	static async deleteMultipleProducts(productIds: string[]): Promise<void> {
		try {
			// Get all products to retrieve image URLs
			const { data: products, error: fetchError } = await supabase
				.from("products")
				.select("id, image_url")
				.in("id", productIds);

			if (fetchError) {
				console.error("Error fetching products for bulk deletion:", fetchError);
				throw new Error(`Failed to fetch products: ${fetchError.message}`);
			}

			// Delete images from storage (parallel execution for better performance)
			const imageDeletePromises =
				products
					?.filter(
						(product) =>
							product.image_url && this.isSupabaseStorageUrl(product.image_url),
					)
					.map(async (product) => {
						try {
							const imagePath = ImageUploadService.extractPathFromUrl(
								product.image_url!,
							);
							await ImageUploadService.deleteImage(imagePath);
							console.log(
								`✅ Deleted image for product ${product.id}: ${imagePath}`,
							);
						} catch (imageError) {
							console.warn(
								`⚠️ Failed to delete image for product ${product.id}:`,
								imageError,
							);
						}
					}) || [];

			// Wait for all image deletions to complete (or fail gracefully)
			await Promise.allSettled(imageDeletePromises);

			// Delete products from database
			const { error: deleteError } = await supabase
				.from("products")
				.delete()
				.in("id", productIds);

			if (deleteError) {
				console.error("Error deleting products from database:", deleteError);
				throw new Error(`Failed to delete products: ${deleteError.message}`);
			}
		} catch (error) {
			console.error("Error in deleteMultipleProducts:", error);
			throw error;
		}
	}

	/**
	 * Check if a URL is from Supabase storage
	 * Only delete images that are stored in our Supabase bucket
	 */
	private static isSupabaseStorageUrl(url: string): boolean {
		return url.includes("/storage/v1/object/public/product-images/");
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

	/**
	 * Mark a product as used by calling the database function
	 */
	static async markProductAsUsed(
		productId: string,
		quantityUsed?: number,
		usageNotes?: string,
	): Promise<boolean> {
		try {
			const { data, error } = await supabase.rpc("mark_product_as_used", {
				product_id_param: productId,
				quantity_used_param: quantityUsed || null,
				usage_notes_param: usageNotes || null,
			});

			if (error) {
				console.error("Error marking product as used:", error);
				throw new Error(`Failed to mark product as used: ${error.message}`);
			}

			return data;
		} catch (error) {
			console.error("Error in markProductAsUsed:", error);
			throw error;
		}
	}

	/**
	 * Get user statistics
	 */
	static async getUserStatistics(): Promise<UserStatistics | null> {
		try {
			const { data, error } = await supabase
				.from("user_statistics")
				.select("*")
				.single();

			if (error) {
				if (error.code === "PGRST116") {
					// No data found, return null
					return null;
				}
				console.error("Error fetching user statistics:", error);
				throw new Error(`Failed to fetch user statistics: ${error.message}`);
			}

			return {
				id: data.id,
				userId: data.user_id,
				totalProductsAdded: data.total_products_added,
				totalProductsUsed: data.total_products_used,
				totalProductsExpired: data.total_products_expired,
				currentActiveProducts: data.current_active_products,
				lastActivityDate: data.last_activity_date,
				createdAt: data.created_at,
				updatedAt: data.updated_at,
			};
		} catch (error) {
			console.error("Error in getUserStatistics:", error);
			throw error;
		}
	}

	/**
	 * Get user analytics with calculated fields
	 */
	static async getUserAnalytics(): Promise<UserAnalytics | null> {
		try {
			const { data, error } = await supabase
				.from("user_analytics")
				.select("*")
				.single();

			if (error) {
				if (error.code === "PGRST116") {
					// No data found, return null
					return null;
				}
				console.error("Error fetching user analytics:", error);
				throw new Error(`Failed to fetch user analytics: ${error.message}`);
			}

			return {
				userId: data.user_id,
				totalProductsAdded: data.total_products_added,
				totalProductsUsed: data.total_products_used,
				totalProductsExpired: data.total_products_expired,
				currentActiveProducts: data.current_active_products,
				lastActivityDate: data.last_activity_date,
				usagePercentage: parseFloat(data.usage_percentage) || 0,
				productsUsedBeforeExpiry: data.products_used_before_expiry,
				productsUsedAfterExpiry: data.products_used_after_expiry,
			};
		} catch (error) {
			console.error("Error in getUserAnalytics:", error);
			throw error;
		}
	}

	/**
	 * Get usage history
	 */
	static async getUsageHistory(): Promise<UsageHistoryItem[]> {
		try {
			const { data, error } = await supabase
				.from("usage_history_with_products")
				.select("*")
				.order("usage_date", { ascending: false });

			if (error) {
				console.error("Error fetching usage history:", error);
				throw new Error(`Failed to fetch usage history: ${error.message}`);
			}

			return (
				data?.map((item) => ({
					id: item.id,
					userId: item.user_id,
					productId: item.product_id,
					usageDate: item.usage_date,
					daysBeforeExpiry: item.days_before_expiry,
					wasExpired: item.was_expired,
					quantityUsed: item.quantity_used,
					usageNotes: item.usage_notes,
					createdAt: item.created_at,
					productName: item.product_name,
					productCategory: item.product_category,
					expiryDate: item.expiry_date,
					productNotes: item.product_notes,
				})) || []
			);
		} catch (error) {
			console.error("Error in getUsageHistory:", error);
			throw error;
		}
	}
}
