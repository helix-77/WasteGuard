import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { AlertIcon, ClockIcon } from "@/components/icons";

interface AlertItem {
	id: string;
	name: string;
	category: string;
	daysLeft: number;
	priority: "high" | "medium" | "low";
}

interface AlertSectionProps {
	alerts: AlertItem[];
	onAlertPress?: (alert: AlertItem) => void;
	onViewAllPress?: () => void;
}

// FlashList implementation with expandable functionality
// - Shows 3 items by default
// - Expands to show 8 items when "View All" is pressed
// - Button text changes to "Show Less" when expanded
// - Uses optimized rendering for better performance
export function AlertSection({
	alerts,
	onAlertPress,
	onViewAllPress,
}: AlertSectionProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const displayedAlerts = isExpanded ? alerts.slice(0, 8) : alerts.slice(0, 8);
	const maxDisplayHeight = isExpanded ? 640 : 240; // More accurate height calculation
	const itemHeight = 76; // More precise item height estimation

	const handleViewAllPress = () => {
		setIsExpanded(!isExpanded);
		onViewAllPress?.();
	};

	const getPriorityVariant = (priority: string) => {
		switch (priority) {
			case "high":
				return "destructive";
			case "medium":
				return "warning";
			default:
				return "secondary";
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "high":
				return "#dc2626"; // red-600
			case "medium":
				return "#ca8a04"; // yellow-600
			default:
				return "#2563eb"; // blue-600
		}
	};

	const renderAlertItem = ({ item: alert }: { item: AlertItem }) => (
		<Pressable onPress={() => onAlertPress?.(alert)} className="mb-3">
			<Card className=" border-red-100 bg-red-50 dark:border-red-900 dark:bg-[#450a0a5c]">
				<CardContent className="p-4">
					<View className="flex-row items-center justify-between">
						<View className="flex-1">
							<Text className="font-semibold text-red-900 dark:text-red-100">
								{alert.name}
							</Text>
							<Text className="text-sm text-red-700 dark:text-red-300 mt-1">
								{alert.category}
								{"• "}
								{alert.daysLeft === 0
									? "Expires today"
									: alert.daysLeft === 1
										? "1 day left"
										: `${alert.daysLeft} days left`}
							</Text>
						</View>
						<View className="flex-row items-center">
							<Badge
								variant={getPriorityVariant(alert.priority)}
								className="mr-2"
							>
								<Text className="text-xs font-medium text-white">
									{alert.priority.toUpperCase()}
								</Text>
							</Badge>
							<ClockIcon size={16} color={getPriorityColor(alert.priority)} />
						</View>
					</View>
				</CardContent>
			</Card>
		</Pressable>
	);

	if (alerts.length === 0) {
		return (
			<Card className="mt-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
				<CardContent className="p-4">
					<View className="flex-row items-center">
						<View className="p-2 rounded-full bg-green-100 dark:bg-green-900 mr-3">
							<ClockIcon size={20} color="#16a34a" />
						</View>
						<View className="flex-1">
							<Text className="font-semibold text-green-900 dark:text-green-100">
								All Clear! 🎉
							</Text>
							<Text className="text-sm text-green-700 dark:text-green-300 mt-1">
								No items expiring soon. Great job managing your items!
							</Text>
						</View>
					</View>
				</CardContent>
			</Card>
		);
	}

	return (
		<View className="mt-6 ">
			<View className="flex-row items-center justify-between mb-4">
				<View className="flex-row items-center">
					{/* <AlertIcon size={20} color="#dc2626" /> */}
					<Text className="font-semibold text-muted-foreground">
						Expiring Soon
					</Text>
					<Badge variant="destructive" className="ml-2">
						<Text className="text-xs font-medium text-white">
							{alerts.length}
						</Text>
					</Badge>
				</View>
				<Pressable onPress={handleViewAllPress}>
					<Text className="text-sm text-primary font-medium">
						{isExpanded ? "Show Less" : "View All"}
					</Text>
				</Pressable>
			</View>

			<View style={{ height: maxDisplayHeight }}>
				<FlashList
					data={displayedAlerts}
					renderItem={renderAlertItem}
					estimatedItemSize={itemHeight}
					showsVerticalScrollIndicator={false}
					keyExtractor={(item) => item.id}
				/>
			</View>
		</View>
	);
}
