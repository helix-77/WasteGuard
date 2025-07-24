import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "./useProductsQuery";
import { ProductService } from "@/lib/services/productService";

export interface DashboardStats {
	expiringSoon: number;
	totalSaved: number;
	itemsConsumed: string;
	itemsTracked: number;
}

/**
 * Hook to fetch dashboard statistics with caching
 */
export function useDashboardStats(): {
	data: DashboardStats | undefined;
	isLoading: boolean;
	error: Error | null;
	refetch: () => void;
} {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: QUERY_KEYS.DASHBOARD_STATS,
		queryFn: async (): Promise<DashboardStats> => {
			// Fetch all products and calculate stats
			const products = await ProductService.getProducts();

			const expiringSoon = products.filter((p) => p.daysLeft <= 3).length;
			const itemsTracked = products.length;

			// Calculate estimated items consumed
			const itemsConsumed = `${(itemsTracked * 0.05).toFixed(1)} kg`;

			// Calculate items saved this month (mock calculation)
			// In a real app, you'd track consumed items
			const totalSaved = Math.floor(itemsTracked * 0.8);

			return {
				expiringSoon,
				totalSaved,
				itemsConsumed: itemsConsumed,
				itemsTracked,
			};
		},
		staleTime: 2 * 60 * 1000, // 2 minutes - stats should be relatively fresh
		gcTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: true,
		refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
		refetchIntervalInBackground: false,
	});

	return {
		data,
		isLoading,
		error,
		refetch,
	};
}
