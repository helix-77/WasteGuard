import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/config/supabase";
import {
	ProductService,
	ProductItem,
	CreateProductInput,
	UpdateProductInput,
} from "@/lib/services/productService";

/**
 * Hook for managing products with real-time updates and optimistic UI
 */
export function useProducts() {
	const [products, setProducts] = useState<ProductItem[]>([]);
	const [categories, setCategories] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	/**
	 * Load products from the database
	 */
	const loadProducts = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await ProductService.getProducts();
			setProducts(data);
		} catch (err) {
			console.error("Error loading products:", err);
			setError(err instanceof Error ? err.message : "Failed to load products");
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Load categories from the database
	 */
	const loadCategories = useCallback(async () => {
		try {
			const data = await ProductService.getCategories();
			setCategories(data);
		} catch (err) {
			console.error("Error loading categories:", err);
		}
	}, []);

	/**
	 * Create a new product with optimistic update
	 */
	const createProduct = useCallback(
		async (productData: CreateProductInput): Promise<void> => {
			try {
				// Optimistic update - add product immediately to UI
				const tempProduct: ProductItem = {
					id: `temp-${Date.now()}`,
					name: productData.name,
					category: productData.category,
					expiryDate: productData.expiryDate,
					daysLeft: Math.ceil(
						(new Date(productData.expiryDate).getTime() -
							new Date().getTime()) /
							(1000 * 60 * 60 * 24),
					),
					quantity: productData.quantity || 1,
					notes: productData.notes,
					imageUrl: productData.imageUrl,
				};

				setProducts((prev) => [...prev, tempProduct]);

				// Create in database
				const newProduct = await ProductService.createProduct(productData);

				// Replace temp product with real one
				setProducts((prev) =>
					prev.map((p) => (p.id === tempProduct.id ? newProduct : p)),
				);

				// Refresh categories if a new category was added
				if (!categories.includes(productData.category)) {
					await loadCategories();
				}
			} catch (err) {
				// Remove optimistic update on error
				setProducts((prev) => prev.filter((p) => !p.id.startsWith("temp-")));
				console.error("Error creating product:", err);
				throw err;
			}
		},
		[categories, loadCategories],
	);

	/**
	 * Update a product with optimistic update
	 */
	const updateProduct = useCallback(
		async (productId: string, updates: UpdateProductInput): Promise<void> => {
			try {
				// Store original product for rollback
				const originalProduct = products.find((p) => p.id === productId);
				if (!originalProduct) {
					throw new Error("Product not found");
				}

				// Optimistic update
				const updatedProduct: ProductItem = {
					...originalProduct,
					...(updates.name && { name: updates.name }),
					...(updates.category && { category: updates.category }),
					...(updates.expiryDate && {
						expiryDate: updates.expiryDate,
						daysLeft: Math.ceil(
							(new Date(updates.expiryDate).getTime() - new Date().getTime()) /
								(1000 * 60 * 60 * 24),
						),
					}),
					...(updates.quantity !== undefined && { quantity: updates.quantity }),
					...(updates.notes !== undefined && { notes: updates.notes }),
					...(updates.imageUrl !== undefined && { imageUrl: updates.imageUrl }),
				};

				setProducts((prev) =>
					prev.map((p) => (p.id === productId ? updatedProduct : p)),
				);

				// Update in database
				const serverProduct = await ProductService.updateProduct(
					productId,
					updates,
				);

				// Update with server response
				setProducts((prev) =>
					prev.map((p) => (p.id === productId ? serverProduct : p)),
				);

				// Refresh categories if category was updated
				if (updates.category && !categories.includes(updates.category)) {
					await loadCategories();
				}
			} catch (err) {
				// Rollback optimistic update on error
				await loadProducts();
				console.error("Error updating product:", err);
				throw err;
			}
		},
		[products, categories, loadProducts, loadCategories],
	);

	/**
	 * Delete a product with optimistic update
	 */
	const deleteProduct = useCallback(
		async (productId: string): Promise<void> => {
			try {
				// Store original for rollback
				const originalProducts = [...products];

				// Optimistic update - remove immediately
				setProducts((prev) => prev.filter((p) => p.id !== productId));

				// Delete from database
				await ProductService.deleteProduct(productId);
			} catch (err) {
				// Rollback on error
				setProducts(products);
				console.error("Error deleting product:", err);
				throw err;
			}
		},
		[products],
	);

	/**
	 * Delete expired products (useful for cleanup operations)
	 */
	const deleteExpiredProducts = useCallback(async (): Promise<number> => {
		try {
			const expiredProducts = products.filter(
				(product) => product.daysLeft <= 0,
			);

			if (expiredProducts.length === 0) {
				return 0;
			}

			const expiredIds = expiredProducts.map((product) => product.id);

			// Store original for rollback
			const originalProducts = [...products];

			// Optimistic update - remove expired products immediately
			setProducts((prev) => prev.filter((p) => p.daysLeft > 0));

			try {
				// Delete from database and storage
				await ProductService.deleteMultipleProducts(expiredIds);
				return expiredProducts.length;
			} catch (err) {
				// Rollback on error
				setProducts(originalProducts);
				throw err;
			}
		} catch (err) {
			console.error("Error deleting expired products:", err);
			throw err;
		}
	}, [products]);

	/**
	 * Search products
	 */
	const searchProducts = useCallback(async (query: string): Promise<void> => {
		try {
			setLoading(true);
			const data = await ProductService.searchProducts(query);
			setProducts(data);
		} catch (err) {
			console.error("Error searching products:", err);
			setError(
				err instanceof Error ? err.message : "Failed to search products",
			);
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Get products by category
	 */
	const getProductsByCategory = useCallback(
		async (category: string): Promise<void> => {
			try {
				setLoading(true);
				const data = await ProductService.getProductsByCategory(category);
				setProducts(data);
			} catch (err) {
				console.error("Error getting products by category:", err);
				setError(err instanceof Error ? err.message : "Failed to get products");
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	/**
	 * Get products expiring soon
	 */
	const getExpiringSoonProducts = useCallback(
		async (withinDays: number = 3): Promise<ProductItem[]> => {
			try {
				return await ProductService.getExpiringSoonProducts(withinDays);
			} catch (err) {
				console.error("Error getting expiring products:", err);
				return [];
			}
		},
		[],
	);

	// Initial load and real-time subscription
	useEffect(() => {
		loadProducts();
		loadCategories();

		// Set up real-time subscription
		const channel = supabase
			.channel("products_changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "products",
				},
				(payload) => {
					// console.log("Product change detected:", payload);
					// Refresh products when any change occurs
					loadProducts();
				},
			)
			.subscribe();

		// Cleanup subscription
		return () => {
			channel.unsubscribe();
		};
	}, [loadProducts, loadCategories]);

	return {
		products,
		categories,
		loading,
		error,
		createProduct,
		updateProduct,
		deleteProduct,
		deleteExpiredProducts,
		searchProducts,
		getProductsByCategory,
		getExpiringSoonProducts,
		refreshProducts: loadProducts,
		refreshCategories: loadCategories,
	};
}
