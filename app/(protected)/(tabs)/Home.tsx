import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { H1, Muted } from "@/components/ui/typography";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentItems } from "@/components/dashboard/recent-items";
import { AlertSection } from "@/components/dashboard/alert-section";

import NotificationDebugger from "@/components/debug/NotificationDebugger";

// Dummy data for demonstration
const mockStats = {
	expiringSoon: 5,
	totalSaved: 127,
	wasteReduced: "2.3 kg",
	itemsTracked: 45,
};

const mockRecentItems = [
	{
		id: "1",
		name: "Organic Spinach",
		category: "Vegetables",
		expiryDate: "2025-07-02",
		daysLeft: 3,
	},
	{
		id: "2",
		name: "Greek Yogurt",
		category: "Dairy",
		expiryDate: "2025-07-01",
		daysLeft: 2,
	},
	{
		id: "3",
		name: "Sourdough Bread",
		category: "Bakery",
		expiryDate: "2025-06-30",
		daysLeft: 1,
	},
	{
		id: "4",
		name: "Avocados",
		category: "Fruits",
		expiryDate: "2025-07-05",
		daysLeft: 6,
	},
];

const mockAlerts = [
	{
		id: "1",
		name: "Fresh Salmon",
		category: "Seafood",
		daysLeft: 0,
		priority: "high" as const,
	},
	{
		id: "2",
		name: "Bell Peppers",
		category: "Vegetables",
		daysLeft: 1,
		priority: "high" as const,
	},
	{
		id: "3",
		name: "Cream Cheese",
		category: "Dairy",
		daysLeft: 2,
		priority: "medium" as const,
	},
	{
		id: "4",
		name: "Ground Turkey",
		category: "Meat",
		daysLeft: 1,
		priority: "high" as const,
	},
	{
		id: "5",
		name: "Strawberries",
		category: "Fruits",
		daysLeft: 2,
		priority: "medium" as const,
	},
	{
		id: "6",
		name: "Spinach Leaves",
		category: "Vegetables",
		daysLeft: 3,
		priority: "medium" as const,
	},
	{
		id: "7",
		name: "Greek Yogurt",
		category: "Dairy",
		daysLeft: 1,
		priority: "high" as const,
	},
	{
		id: "8",
		name: "Chicken Breast",
		category: "Meat",
		daysLeft: 0,
		priority: "high" as const,
	},
	{
		id: "9",
		name: "Bananas",
		category: "Fruits",
		daysLeft: 4,
		priority: "low" as const,
	},
	{
		id: "10",
		name: "Milk",
		category: "Dairy",
		daysLeft: 3,
		priority: "medium" as const,
	},
];

export default function Home() {
	// const [showDebugger, setShowDebugger] = useState(false);

	const handleStatsPress = (statType: string) => {
		// TODO: Navigate to detailed stats view
		// setShowDebugger(true);
		console.log(`${statType} stats pressed`);
	};

	const handleItemPress = (item: any) => {
		// TODO: Navigate to item details
		console.log("Item pressed:", item.name);
	};

	const handleAlertPress = (alert: any) => {
		// TODO: Navigate to item details or action menu
		console.log("Alert pressed:", alert.name);
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 32 }}
				showsVerticalScrollIndicator={false}
			>
				{/* {showDebugger && (
					<NotificationDebugger onClose={() => setShowDebugger(false)} />
				)} */}
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
							value={mockStats.expiringSoon}
							description="Items need attention"
							variant="warning"
							onPress={() => handleStatsPress("expiring")}
						/>
						<StatsCard
							title="Items Saved"
							value={mockStats.totalSaved}
							description="This month"
							variant="success"
							onPress={() => handleStatsPress("saved")}
						/>
					</View>

					<View className="flex-row gap-3 mb-6">
						<StatsCard
							title="Waste Reduced"
							value={mockStats.wasteReduced}
							description="Environmental impact"
							variant="success"
							onPress={() => handleStatsPress("waste")}
						/>
						<StatsCard
							title="Total Items"
							value={mockStats.itemsTracked}
							description="Being tracked"
							variant="default"
							onPress={() => handleStatsPress("total")}
						/>
					</View>

					{/* Recent Items */}
					<RecentItems items={mockRecentItems} onItemPress={handleItemPress} />

					{/* Alerts Section */}
					<AlertSection alerts={mockAlerts} onAlertPress={handleAlertPress} />
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
