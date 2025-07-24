import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { QUERY_KEYS } from "./useProductsQuery";

/**
 * Hook for manual cache invalidation and optimization
 * Provides fine-grained control over when to invalidate specific queries
 */
export function useOptimizedQueries() {
	const queryClient = useQueryClient();

	// Invalidate all product-related queries
	const invalidateAllProducts = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
		queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
		queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
	}, [queryClient]);

	// Invalidate only dashboard stats (for performance)
	const invalidateStats = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
	}, [queryClient]);

	// Pre-fetch products for better UX
	const prefetchProducts = useCallback(() => {
		queryClient.prefetchQuery({
			queryKey: QUERY_KEYS.PRODUCTS,
			staleTime: 5 * 60 * 1000, // 5 minutes
		});
	}, [queryClient]);

	// Clear all cached data (useful for logout)
	const clearAllCache = useCallback(() => {
		queryClient.clear();
	}, [queryClient]);

	// Get cached data without triggering a request
	const getCachedProducts = useCallback(() => {
		return queryClient.getQueryData(QUERY_KEYS.PRODUCTS);
	}, [queryClient]);

	// Check if queries are loading
	const areQueriesLoading = useCallback(() => {
		return queryClient.isFetching() > 0;
	}, [queryClient]);

	// Optimistic update helper for manual cache updates
	const updateProductInCache = useCallback(
		(productId: string, updater: (oldData: any) => any) => {
			queryClient.setQueryData(QUERY_KEYS.PRODUCTS, (oldData: any) => {
				if (!oldData) return oldData;
				return oldData.map((product: any) =>
					product.id === productId ? updater(product) : product,
				);
			});
		},
		[queryClient],
	);

	return {
		invalidateAllProducts,
		invalidateStats,
		prefetchProducts,
		clearAllCache,
		getCachedProducts,
		areQueriesLoading,
		updateProductInCache,
	};
}
