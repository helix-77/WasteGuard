import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface QueryProviderProps {
	children: React.ReactNode;
}

// Create a client with optimized settings for the WasteGuard app
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Cache data for 5 minutes (good for inventory that doesn't change frequently)
			staleTime: 5 * 60 * 1000, // 5 minutes
			// Keep data in memory for 15 minutes after component unmounts
			gcTime: 15 * 60 * 1000, // 15 minutes (increased for better UX)
			// Retry failed requests 2 times with exponential backoff
			retry: (failureCount, error: any) => {
				// Don't retry on authentication errors
				if (error?.status === 401 || error?.status === 403) {
					return false;
				}
				// Retry network errors up to 3 times
				return failureCount < 3;
			},
			// Retry with exponential backoff (max 30 seconds)
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
			// Refetch on window focus (good for when user returns to app)
			refetchOnWindowFocus: true,
			// Don't refetch on reconnect to avoid excessive requests
			refetchOnReconnect: "always", // Changed to always for offline->online transitions
			// Refetch on mount only if data is fresh
			refetchOnMount: false,
			// Network mode - shows cached data while offline
			networkMode: "offlineFirst",
		},
		mutations: {
			// Retry mutations once on failure (except auth errors)
			retry: (failureCount, error: any) => {
				if (error?.status === 401 || error?.status === 403) {
					return false;
				}
				return failureCount < 2;
			},
			// Retry delay for mutations (shorter than queries)
			retryDelay: 1000,
			// Network mode for mutations
			networkMode: "online",
		},
	},
});

// Add global error handling
queryClient.setQueryDefaults(["products"], {
	staleTime: 3 * 60 * 1000, // Products can be cached for 3 minutes
	gcTime: 10 * 60 * 1000,
});

queryClient.setQueryDefaults(["dashboard", "stats"], {
	staleTime: 2 * 60 * 1000, // Stats need to be fresher
	gcTime: 5 * 60 * 1000,
	refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
});

queryClient.setQueryDefaults(["categories"], {
	staleTime: 30 * 60 * 1000, // Categories rarely change
	gcTime: 60 * 60 * 1000, // Keep for 1 hour
	refetchOnWindowFocus: false,
});

/**
 * TanStack Query Provider for WasteGuard
 *
 * Optimized configuration for:
 * - Intelligent caching with different strategies per data type
 * - Background updates for real-time experience
 * - Optimistic updates for immediate UI feedback
 * - Offline-first approach for better UX
 * - Reduced API calls and server costs
 */
export function QueryProvider({ children }: QueryProviderProps) {
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}

// Export the query client for manual operations if needed
export { queryClient };
