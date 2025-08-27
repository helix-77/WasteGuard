import React from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";

import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentItems } from "@/components/dashboard/recent-items";
import { AlertSection } from "@/components/dashboard/alert-section";
import {
	useProducts,
	useExpiringSoonProducts,
} from "@/lib/hooks/useProductsQuery";
import { useUserAnalytics } from "@/lib/hooks/useUserStatistics";
import { Text } from "@/components/ui/text";
import { RefreshCw } from "lucide-react-native";
import { ProductItem } from "@/lib/services/productService";

export default function Home() {
	// TanStack Query hooks with intelligent caching
	const {
		data: products = [],
		isLoading: productsLoading,
		error: productsError,
		refetch: refetchProducts,
	} = useProducts();

	const {
		data: userAnalytics,
		isLoading: analyticsLoading,
		error: analyticsError,
		refetch: refetchAnalytics,
	} = useUserAnalytics();

	const { data: expiringItems = [] } = useExpiringSoonProducts(3);

	const handleStatsPress = (statType: string) => {
		// console.log(`${statType} stats pressed`);
		// Add navigation logic here based on statType
	};

	const handleItemPress = (item: ProductItem) => {
		// console.log("Item pressed:", item.name);
		// Add navigation to item details
	};

	const handleAlertPress = (alert: any) => {
		// console.log("Alert pressed:", alert.name);
		// Add navigation to expiring item
	};

	const handleRefresh = () => {
		refetchProducts();
		refetchAnalytics();
	};

	// Show loading state
	if (productsLoading || analyticsLoading) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center">
					<RefreshCw size={32} className="text-muted-foreground animate-spin" />
					<Text className="text-muted-foreground mt-4">
						Loading dashboard...
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	// Show error state
	if (productsError || analyticsError) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-destructive text-center mb-4">
						{productsError?.message ||
							analyticsError?.message ||
							"Something went wrong"}
					</Text>
					<Text className="text-primary font-medium" onPress={handleRefresh}>
						Tap to retry
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	// Get recent items (first 4)
	const recentItems = products?.slice(0, 4) || [];

	// Transform expiring items to alert format
	const alertItems = expiringItems.map((item) => ({
		...item,
		priority:
			item.daysLeft <= 1 ? "high" : item.daysLeft <= 3 ? "medium" : "low",
	})) as any[];

	// Get analytics data with fallbacks
	const analyticsData = userAnalytics || {
		productsUsedBeforeExpiry: 0,
		totalProductsUsed: 0,
		currentActiveProducts: products?.length || 0,
		usagePercentage: 0,
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 32 }}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={productsLoading || analyticsLoading}
						onRefresh={handleRefresh}
						colors={["#22c55e"]} // Android
						tintColor="#22c55e" // iOS
					/>
				}
			>
				<View className="px-6 py-4">
					{/* Header */}
					<View className="mb-8">
						<Text
							variant="h1"
							className="text-3xl font-bold text-foreground mb-2"
						>
							Good morning! 🌱
						</Text>
						<Text variant="muted" className="text-base">
							Let&apos;s keep track of your items and reduce waste together
						</Text>
					</View>

					{/* Stats Cards */}
					<View className="flex-row gap-3 mb-6">
						<StatsCard
							title="Expiring Soon"
							value={expiringItems.length}
							description="Items need attention"
							variant="warning"
							onPress={() => handleStatsPress("expiring")}
						/>
						<StatsCard
							title="Items Saved"
							value={analyticsData.productsUsedBeforeExpiry}
							description="Used before expiry"
							variant="success-glow"
							onPress={() => handleStatsPress("saved")}
						/>
					</View>

					<View className="flex-row gap-3 mb-6">
						<StatsCard
							title="Items Consumed"
							value={analyticsData.totalProductsUsed}
							description="Total items used"
							variant="dim"
							onPress={() => handleStatsPress("consumed")}
						/>
						<StatsCard
							title="Active Items"
							value={analyticsData.currentActiveProducts}
							description="Currently tracking"
							variant="default"
							onPress={() => handleStatsPress("total")}
						/>
					</View>

					{/* Usage Efficiency Card */}
					{userAnalytics && userAnalytics.totalProductsAdded > 0 && (
						<View className="mb-6">
							<StatsCard
								title="Usage Efficiency"
								value={`${analyticsData.usagePercentage.toFixed(1)}%`}
								description={`${analyticsData.productsUsedBeforeExpiry} saved from waste`}
								variant="success-glow"
								onPress={() => handleStatsPress("efficiency")}
							/>
						</View>
					)}

					{/* Recent Items */}
					<RecentItems items={recentItems} onItemPress={handleItemPress} />

					{/* Alerts Section */}
					<AlertSection alerts={alertItems} onAlertPress={handleAlertPress} />
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
