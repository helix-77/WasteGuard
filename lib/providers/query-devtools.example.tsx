// Optional: Add TanStack Query DevTools for development
// Install with: npm install @tanstack/react-query-devtools

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Add to your QueryProvider component:
export function QueryProvider({ children }: QueryProviderProps) {
	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{/* Only show in development */}
			{__DEV__ && (
				<ReactQueryDevtools
					initialIsOpen={false}
					position="bottom-right"
					buttonPosition="bottom-right"
				/>
			)}
		</QueryClientProvider>
	);
}

// Example of advanced cache warming on app start:
export function warmCache() {
	// Pre-fetch critical data on app launch
	queryClient.prefetchQuery({
		queryKey: QUERY_KEYS.PRODUCTS,
		queryFn: ProductService.getProducts,
	});

	queryClient.prefetchQuery({
		queryKey: QUERY_KEYS.DASHBOARD_STATS,
		queryFn: async () => {
			const products = await ProductService.getProducts();
			// Calculate stats...
		},
	});
}

// Call warmCache() in your app initialization
