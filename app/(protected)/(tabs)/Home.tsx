import React from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { H1, Muted } from "@/components/ui/typography";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentItems } from "@/components/dashboard/recent-items";
import { AlertSection } from "@/components/dashboard/alert-section";
import {
	useProducts,
	useExpiringSoonProducts,
} from "@/lib/hooks/useProductsQuery";
import { useDashboardStats } from "@/lib/hooks/useDashboardStats";
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
		data: stats,
		isLoading: statsLoading,
		error: statsError,
		refetch: refetchStats,
	} = useDashboardStats();

	const { data: expiringItems = [] } = useExpiringSoonProducts(3);

	const handleStatsPress = (statType: string) => {
		console.log(`${statType} stats pressed`);
		// Add navigation logic here based on statType
	};

	const handleItemPress = (item: ProductItem) => {
		console.log("Item pressed:", item.name);
		// Add navigation to item details
	};

	const handleAlertPress = (alert: any) => {
		console.log("Alert pressed:", alert.name);
		// Add navigation to expiring item
	};

	const handleRefresh = () => {
		refetchProducts();
		refetchStats();
	};

	// Show loading state
	if (productsLoading || statsLoading) {
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
	if (productsError || statsError) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-destructive text-center mb-4">
						{productsError?.message ||
							statsError?.message ||
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

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 32 }}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={productsLoading || statsLoading}
						onRefresh={handleRefresh}
						colors={["#22c55e"]} // Android
						tintColor="#22c55e" // iOS
					/>
				}
			>
				<View className="px-6 py-4">
					{/* Header */}
					<View className="mb-8">
						<H1 className="text-3xl font-bold text-foreground mb-2">
							Good morning! 🌱
						</H1>
						<Muted className="text-base">
							Let&apos;s keep track of your items and reduce waste together
						</Muted>
					</View>

					{/* Stats Cards */}
					<View className="flex-row gap-3 mb-6">
						<StatsCard
							title="Expiring Soon"
							value={stats?.expiringSoon || 0}
							description="Items need attention"
							variant="warning"
							onPress={() => handleStatsPress("expiring")}
						/>
						<StatsCard
							title="Items Saved"
							value={stats?.totalSaved || 0}
							description="This month"
							variant="success"
							onPress={() => handleStatsPress("saved")}
						/>
					</View>

					<View className="flex-row gap-3 mb-6">
						<StatsCard
							title="Waste Reduced"
							value={stats?.wasteReduced || "0 kg"}
							description="Environmental impact"
							variant="success"
							onPress={() => handleStatsPress("waste")}
						/>
						<StatsCard
							title="Total Items"
							value={stats?.itemsTracked || 0}
							description="Being tracked"
							variant="default"
							onPress={() => handleStatsPress("total")}
						/>
					</View>

					{/* Recent Items */}
					<RecentItems items={recentItems} onItemPress={handleItemPress} />

					{/* Alerts Section */}
					<AlertSection alerts={alertItems} onAlertPress={handleAlertPress} />
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
