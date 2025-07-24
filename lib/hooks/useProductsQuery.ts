import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	ProductService,
	ProductItem,
	CreateProductInput,
	UpdateProductInput,
} from "@/lib/services/productService";
import { USER_STATS_QUERY_KEYS } from "./useUserStatistics";

// Query Keys - centralized for consistency
export const QUERY_KEYS = {
	PRODUCTS: ["products"] as const,
	PRODUCT: (id: string) => ["products", id] as const,
	CATEGORIES: ["categories"] as const,
	EXPIRING_PRODUCTS: (days: number) => ["products", "expiring", days] as const,
	PRODUCT_SEARCH: (query: string) => ["products", "search", query] as const,
	PRODUCTS_BY_CATEGORY: (category: string) =>
		["products", "category", category] as const,
	DASHBOARD_STATS: ["dashboard", "stats"] as const,
} as const;

/**
 * Hook to fetch all products with intelligent caching
 */
export function useProducts() {
	return useQuery({
		queryKey: QUERY_KEYS.PRODUCTS,
		queryFn: ProductService.getProducts,
		staleTime: 3 * 60 * 1000, // 3 minutes - products don't change super frequently
		gcTime: 10 * 60 * 1000, // 10 minutes
		refetchOnWindowFocus: true,
		refetchOnMount: false, // Don't refetch if we have fresh data
	});
}

/**
 * Hook to fetch products by category with caching
 */
export function useProductsByCategory(category: string) {
	return useQuery({
		queryKey: QUERY_KEYS.PRODUCTS_BY_CATEGORY(category),
		queryFn: () => ProductService.getProductsByCategory(category),
		enabled: !!category, // Only run if category is provided
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000,
	});
}

/**
 * Hook to fetch products expiring soon with automatic refresh
 */
export function useExpiringSoonProducts(withinDays: number = 3) {
	return useQuery({
		queryKey: QUERY_KEYS.EXPIRING_PRODUCTS(withinDays),
		queryFn: () => ProductService.getExpiringSoonProducts(withinDays),
		staleTime: 2 * 60 * 1000, // 2 minutes - expiring products need fresher data
		gcTime: 5 * 60 * 1000,
		refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
		refetchIntervalInBackground: false, // Don't refresh when app is in background
	});
}

/**
 * Hook to search products with debounced caching
 */
export function useSearchProducts(query: string) {
	return useQuery({
		queryKey: QUERY_KEYS.PRODUCT_SEARCH(query),
		queryFn: () => ProductService.searchProducts(query),
		enabled: query.length >= 2, // Only search with 2+ characters
		staleTime: 10 * 60 * 1000, // 10 minutes - search results can be cached longer
		gcTime: 15 * 60 * 1000,
	});
}

/**
 * Hook to fetch categories with long-term caching
 */
export function useCategories() {
	return useQuery({
		queryKey: QUERY_KEYS.CATEGORIES,
		queryFn: ProductService.getCategories,
		staleTime: 30 * 60 * 1000, // 30 minutes - categories change rarely
		gcTime: 60 * 60 * 1000, // 1 hour
		refetchOnWindowFocus: false, // Categories rarely change
	});
}

/**
 * Hook to create a product with optimistic updates
 */
export function useCreateProduct() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (productData: CreateProductInput) =>
			ProductService.createProduct(productData),
		onMutate: async (newProduct) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: QUERY_KEYS.PRODUCTS });

			// Snapshot previous value
			const previousProducts = queryClient.getQueryData<ProductItem[]>(
				QUERY_KEYS.PRODUCTS,
			);

			// Optimistically update cache
			if (previousProducts) {
				const tempProduct: ProductItem = {
					id: `temp-${Date.now()}`,
					name: newProduct.name,
					category: newProduct.category,
					expiryDate: newProduct.expiryDate,
					daysLeft: Math.ceil(
						(new Date(newProduct.expiryDate).getTime() - new Date().getTime()) /
							(1000 * 60 * 60 * 24),
					),
					quantity: newProduct.quantity || 1,
					notes: newProduct.notes,
					imageUrl: newProduct.imageUrl,
				};

				queryClient.setQueryData<ProductItem[]>(QUERY_KEYS.PRODUCTS, [
					...previousProducts,
					tempProduct,
				]);
			}

			return { previousProducts };
		},
		onError: (err, newProduct, context) => {
			// Rollback on error
			if (context?.previousProducts) {
				queryClient.setQueryData(QUERY_KEYS.PRODUCTS, context.previousProducts);
			}
		},
		onSuccess: (data) => {
			// Replace temp product with real one
			const previousProducts = queryClient.getQueryData<ProductItem[]>(
				QUERY_KEYS.PRODUCTS,
			);
			if (previousProducts) {
				const updatedProducts = previousProducts.map((p) =>
					p.id.startsWith("temp-") ? data : p,
				);
				queryClient.setQueryData(QUERY_KEYS.PRODUCTS, updatedProducts);
			}
		},
		onSettled: () => {
			// Always refetch to ensure consistency
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
		},
	});
}

/**
 * Hook to update a product with optimistic updates
 */
export function useUpdateProduct() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			productId,
			updates,
		}: {
			productId: string;
			updates: UpdateProductInput;
		}) => ProductService.updateProduct(productId, updates),
		onMutate: async ({ productId, updates }) => {
			await queryClient.cancelQueries({ queryKey: QUERY_KEYS.PRODUCTS });

			const previousProducts = queryClient.getQueryData<ProductItem[]>(
				QUERY_KEYS.PRODUCTS,
			);

			if (previousProducts) {
				const updatedProducts = previousProducts.map((product) => {
					if (product.id === productId) {
						const updatedProduct = { ...product };
						if (updates.name !== undefined) updatedProduct.name = updates.name;
						if (updates.category !== undefined)
							updatedProduct.category = updates.category;
						if (updates.expiryDate !== undefined) {
							updatedProduct.expiryDate = updates.expiryDate;
							updatedProduct.daysLeft = Math.ceil(
								(new Date(updates.expiryDate).getTime() -
									new Date().getTime()) /
									(1000 * 60 * 60 * 24),
							);
						}
						if (updates.quantity !== undefined)
							updatedProduct.quantity = updates.quantity;
						if (updates.notes !== undefined)
							updatedProduct.notes = updates.notes;
						if (updates.imageUrl !== undefined)
							updatedProduct.imageUrl = updates.imageUrl;
						return updatedProduct;
					}
					return product;
				});

				queryClient.setQueryData(QUERY_KEYS.PRODUCTS, updatedProducts);
			}

			return { previousProducts };
		},
		onError: (err, variables, context) => {
			if (context?.previousProducts) {
				queryClient.setQueryData(QUERY_KEYS.PRODUCTS, context.previousProducts);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
		},
	});
}

/**
 * Hook to delete a product with optimistic updates
 */
export function useDeleteProduct() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (productId: string) => ProductService.deleteProduct(productId),
		onMutate: async (productId) => {
			await queryClient.cancelQueries({ queryKey: QUERY_KEYS.PRODUCTS });

			const previousProducts = queryClient.getQueryData<ProductItem[]>(
				QUERY_KEYS.PRODUCTS,
			);

			if (previousProducts) {
				const filteredProducts = previousProducts.filter(
					(p) => p.id !== productId,
				);
				queryClient.setQueryData(QUERY_KEYS.PRODUCTS, filteredProducts);
			}

			return { previousProducts };
		},
		onError: (err, productId, context) => {
			if (context?.previousProducts) {
				queryClient.setQueryData(QUERY_KEYS.PRODUCTS, context.previousProducts);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
		},
	});
}

/**
 * Hook to delete multiple products (bulk operation)
 */
export function useDeleteMultipleProducts() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (productIds: string[]) =>
			ProductService.deleteMultipleProducts(productIds),
		onMutate: async (productIds) => {
			await queryClient.cancelQueries({ queryKey: QUERY_KEYS.PRODUCTS });

			const previousProducts = queryClient.getQueryData<ProductItem[]>(
				QUERY_KEYS.PRODUCTS,
			);

			if (previousProducts) {
				const filteredProducts = previousProducts.filter(
					(p) => !productIds.includes(p.id),
				);
				queryClient.setQueryData(QUERY_KEYS.PRODUCTS, filteredProducts);
			}

			return { previousProducts };
		},
		onError: (err, productIds, context) => {
			if (context?.previousProducts) {
				queryClient.setQueryData(QUERY_KEYS.PRODUCTS, context.previousProducts);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
		},
	});
}

/**
 * Hook to mark a product as used
 */
export function useMarkProductAsUsed() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			productId,
			quantityUsed,
			usageNotes,
		}: {
			productId: string;
			quantityUsed?: number;
			usageNotes?: string;
		}) => ProductService.markProductAsUsed(productId, quantityUsed, usageNotes),
		onMutate: async ({ productId, quantityUsed }) => {
			await queryClient.cancelQueries({ queryKey: QUERY_KEYS.PRODUCTS });

			const previousProducts = queryClient.getQueryData<ProductItem[]>(
				QUERY_KEYS.PRODUCTS,
			);

			if (previousProducts && quantityUsed) {
				const updatedProducts = previousProducts
					.map((product) => {
						if (product.id === productId) {
							const remainingQuantity = (product.quantity || 1) - quantityUsed;
							if (remainingQuantity <= 0) {
								// Remove product if no quantity left
								return null;
							}
							return { ...product, quantity: remainingQuantity };
						}
						return product;
					})
					.filter(Boolean) as ProductItem[];

				queryClient.setQueryData(QUERY_KEYS.PRODUCTS, updatedProducts);
			} else if (previousProducts) {
				// Remove the product completely if no quantity specified
				const filteredProducts = previousProducts.filter(
					(p) => p.id !== productId,
				);
				queryClient.setQueryData(QUERY_KEYS.PRODUCTS, filteredProducts);
			}

			return { previousProducts };
		},
		onError: (err, variables, context) => {
			if (context?.previousProducts) {
				queryClient.setQueryData(QUERY_KEYS.PRODUCTS, context.previousProducts);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
			queryClient.invalidateQueries({
				queryKey: USER_STATS_QUERY_KEYS.USER_STATISTICS,
			});
			queryClient.invalidateQueries({
				queryKey: USER_STATS_QUERY_KEYS.USAGE_HISTORY,
			});
			queryClient.invalidateQueries({
				queryKey: USER_STATS_QUERY_KEYS.USER_ANALYTICS,
			});
		},
	});
}
