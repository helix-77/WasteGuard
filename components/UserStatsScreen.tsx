import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import {
	BarChart3,
	TrendingUp,
	Package,
	CheckCircle,
} from "lucide-react-native";
import { useUserAnalytics } from "@/lib/hooks/useUserStatistics";

export default function UserStatsScreen() {
	const { data: analytics, isLoading, error } = useUserAnalytics();

	if (isLoading) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center">
					<Text className="text-muted-foreground">
						Loading your statistics...
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (error) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center p-4">
					<BarChart3 size={48} color="#ef4444" />
					<Text className="text-foreground text-lg font-semibold mt-4">
						Failed to load statistics
					</Text>
					<Text className="text-muted-foreground text-center mt-2">
						{error.message || "An error occurred"}
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (!analytics) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center">
					<Package size={64} color="#9ca3af" />
					<Text className="text-muted-foreground text-lg font-semibold mt-4">
						No statistics yet
					</Text>
					<Text className="text-muted-foreground text-center mt-2">
						Add some products to see your usage statistics
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	const StatCard = ({
		title,
		value,
		subtitle,
		icon,
		color = "#22c55e",
	}: {
		title: string;
		value: string | number;
		subtitle: string;
		icon: React.ReactNode;
		color?: string;
	}) => (
		<View className="bg-card rounded-2xl p-4 shadow-sm flex-1">
			<View className="flex-row items-center justify-between mb-3">
				<View
					className="w-10 h-10 rounded-full items-center justify-center"
					style={{ backgroundColor: `${color}20` }}
				>
					{icon}
				</View>
			</View>
			<Text className="text-2xl font-bold text-foreground">{value}</Text>
			<Text className="text-sm font-medium text-foreground mt-1">{title}</Text>
			<Text className="text-xs text-muted-foreground mt-1">{subtitle}</Text>
		</View>
	);

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1 px-4 py-2">
				{/* Header */}
				<View className="mb-6">
					<Text className="text-2xl font-bold text-foreground">
						Your Statistics
					</Text>
					<Text className="text-muted-foreground mt-1">
						Track your product management performance
					</Text>
				</View>

				{/* Main Stats Row */}
				<View className="flex-row gap-3 mb-4">
					<StatCard
						title="Products Added"
						value={analytics.totalProductsAdded}
						subtitle="Total items added"
						icon={<Package size={20} color="#22c55e" />}
						color="#22c55e"
					/>
					<StatCard
						title="Products Used"
						value={analytics.totalProductsUsed}
						subtitle="Successfully consumed"
						icon={<CheckCircle size={20} color="#3b82f6" />}
						color="#3b82f6"
					/>
				</View>

				{/* Second Row */}
				<View className="flex-row gap-3 mb-4">
					<StatCard
						title="Active Products"
						value={analytics.currentActiveProducts}
						subtitle="Currently available"
						icon={<TrendingUp size={20} color="#f59e0b" />}
						color="#f59e0b"
					/>
					<StatCard
						title="Expired Products"
						value={analytics.totalProductsExpired}
						subtitle="Went unused"
						icon={<BarChart3 size={20} color="#ef4444" />}
						color="#ef4444"
					/>
				</View>

				{/* Usage Efficiency Card */}
				<View className="bg-card rounded-2xl p-6 shadow-sm mb-4">
					<Text className="text-lg font-semibold text-foreground mb-4">
						Usage Efficiency
					</Text>

					<View className="flex-row items-center justify-between mb-4">
						<Text className="text-3xl font-bold text-green-600">
							{analytics.usagePercentage.toFixed(1)}%
						</Text>
						<View className="items-end">
							<Text className="text-sm text-muted-foreground">
								Overall usage rate
							</Text>
						</View>
					</View>

					<View className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full mb-4">
						<View
							className="bg-green-500 h-2 rounded-full"
							style={{ width: `${analytics.usagePercentage}%` }}
						/>
					</View>

					<View className="flex-row justify-between">
						<View className="items-center">
							<Text className="text-lg font-semibold text-green-600">
								{analytics.productsUsedBeforeExpiry}
							</Text>
							<Text className="text-xs text-muted-foreground text-center">
								Used before expiry
							</Text>
						</View>
						<View className="items-center">
							<Text className="text-lg font-semibold text-red-600">
								{analytics.productsUsedAfterExpiry}
							</Text>
							<Text className="text-xs text-muted-foreground text-center">
								Used after expiry
							</Text>
						</View>
					</View>
				</View>

				{/* Last Activity */}
				<View className="bg-card rounded-2xl p-4 shadow-sm">
					<Text className="text-sm font-medium text-foreground">
						Last Activity
					</Text>
					<Text className="text-xs text-muted-foreground mt-1">
						{new Date(analytics.lastActivityDate).toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
