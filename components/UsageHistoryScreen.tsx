import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { CheckCircle, AlertCircle, Package } from "lucide-react-native";
import { useUsageHistory } from "@/lib/hooks/useUserStatistics";

// Simple relative time formatter
const formatRelativeTime = (date: string) => {
	const now = new Date();
	const usageDate = new Date(date);
	const diffInSeconds = Math.floor(
		(now.getTime() - usageDate.getTime()) / 1000,
	);

	if (diffInSeconds < 60) return "just now";
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
	if (diffInSeconds < 604800)
		return `${Math.floor(diffInSeconds / 86400)}d ago`;
	return usageDate.toLocaleDateString();
};

export default function UsageHistoryScreen() {
	const { data: usageHistory = [], isLoading, error } = useUsageHistory();

	if (isLoading) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center">
					<Text className="text-muted-foreground">
						Loading usage history...
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (error) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center p-4">
					<AlertCircle size={48} color="#ef4444" />
					<Text className="text-foreground text-lg font-semibold mt-4">
						Failed to load usage history
					</Text>
					<Text className="text-muted-foreground text-center mt-2">
						{error.message || "An error occurred"}
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-1 px-4 py-2">
				{/* Header */}
				<View className="mb-6">
					<Text className="text-2xl font-bold text-foreground">
						Usage History
					</Text>
					<Text className="text-muted-foreground mt-1">
						Track your product usage over time
					</Text>
				</View>

				{usageHistory.length === 0 ? (
					<View className="flex-1 items-center justify-center">
						<Package size={64} color="#9ca3af" />
						<Text className="text-muted-foreground text-lg font-semibold mt-4">
							No usage history yet
						</Text>
						<Text className="text-muted-foreground text-center mt-2">
							Start marking products as used to see your history here
						</Text>
					</View>
				) : (
					<ScrollView showsVerticalScrollIndicator={false}>
						{usageHistory.map((item) => (
							<View
								key={item.id}
								className="bg-card rounded-2xl p-4 mb-3 shadow-sm"
							>
								<View className="flex-row items-start justify-between">
									<View className="flex-1">
										<View className="flex-row items-center">
											{item.wasExpired ? (
												<AlertCircle size={16} color="#ef4444" />
											) : (
												<CheckCircle size={16} color="#22c55e" />
											)}
											<Text className="text-lg font-semibold text-foreground ml-2">
												{item.productName}
											</Text>
										</View>
										<Text className="text-sm text-muted-foreground mt-1">
											{item.productCategory}
										</Text>
										<View className="flex-row items-center mt-2">
											<Text className="text-xs text-muted-foreground">
												Used {formatRelativeTime(item.usageDate)}
											</Text>
											{item.quantityUsed > 1 && (
												<Text className="text-xs text-muted-foreground ml-2">
													• Qty: {item.quantityUsed}
												</Text>
											)}
										</View>
									</View>
									<View className="items-end">
										<View
											className={`px-3 py-1 rounded-full ${
												item.wasExpired
													? "bg-red-100 dark:bg-red-950/50"
													: "bg-green-100 dark:bg-green-950/50"
											}`}
										>
											<Text
												className={`text-xs font-medium ${
													item.wasExpired
														? "text-red-600 dark:text-red-400"
														: "text-green-600 dark:text-green-400"
												}`}
											>
												{item.wasExpired
													? "After expiry"
													: `${item.daysBeforeExpiry} days before expiry`}
											</Text>
										</View>
									</View>
								</View>
								{item.usageNotes && (
									<View className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
										<Text className="text-xs text-muted-foreground italic">
											Note: {item.usageNotes}
										</Text>
									</View>
								)}
							</View>
						))}
					</ScrollView>
				)}
			</View>
		</SafeAreaView>
	);
}
