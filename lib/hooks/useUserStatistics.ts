import { useQuery } from "@tanstack/react-query";
import { ProductService } from "@/lib/services/productService";

/**
 * Query keys for user statistics
 */
export const USER_STATS_QUERY_KEYS = {
	USER_STATISTICS: ["user", "statistics"] as const,
	USER_ANALYTICS: ["user", "analytics"] as const,
	USAGE_HISTORY: ["usage", "history"] as const,
} as const;

/**
 * Hook to fetch user statistics
 */
export function useUserStatistics() {
	return useQuery({
		queryKey: USER_STATS_QUERY_KEYS.USER_STATISTICS,
		queryFn: ProductService.getUserStatistics,
		staleTime: 2 * 60 * 1000, // 2 minutes
		gcTime: 10 * 60 * 1000,
		refetchOnWindowFocus: true,
	});
}

/**
 * Hook to fetch user analytics (with calculated percentages)
 */
export function useUserAnalytics() {
	return useQuery({
		queryKey: USER_STATS_QUERY_KEYS.USER_ANALYTICS,
		queryFn: ProductService.getUserAnalytics,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 15 * 60 * 1000,
		refetchOnWindowFocus: true,
	});
}

/**
 * Hook to fetch usage history
 */
export function useUsageHistory() {
	return useQuery({
		queryKey: USER_STATS_QUERY_KEYS.USAGE_HISTORY,
		queryFn: ProductService.getUsageHistory,
		staleTime: 3 * 60 * 1000, // 3 minutes
		gcTime: 10 * 60 * 1000,
	});
}
