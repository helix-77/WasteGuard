import React from "react";
import { View, ScrollView, Pressable, TouchableOpacity } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from "@/components/icons";
import { router } from "expo-router";

interface RecentItem {
	id: string;
	name: string;
	category: string;
	expiryDate: string;
	daysLeft: number;
	imageUrl?: string;
}

interface RecentItemsProps {
	items: RecentItem[];
	onItemPress?: (item: RecentItem) => void;
}

export function RecentItems({ items, onItemPress }: RecentItemsProps) {
	const getExpiryVariant = (daysLeft: number) => {
		if (daysLeft <= 1) return "destructive";
		if (daysLeft <= 3) return "warning";
		return "success";
	};

	const getExpiryText = (daysLeft: number) => {
		if (daysLeft === 0) return "Expires today";
		if (daysLeft === 1) return "1 day left";
		if (daysLeft < 0) return `Expired ${Math.abs(daysLeft)} days ago`;
		return `${daysLeft} days left`;
	};

	const handleViewAllProducts = () => {
		// Handle view all products action
		router.push("/screens/productList");
	};

	return (
		<View className="mt-6">
			<View className="flex-row items-center justify-between mb-4">
				<Text className="text-lg font-semibold text-foreground">
					Recently Added
				</Text>
				<TouchableOpacity onPress={handleViewAllProducts}>
					<Text className="text-sm text-primary font-medium">View All</Text>
				</TouchableOpacity>
			</View>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				className="gap-4"
				contentContainerStyle={{ paddingHorizontal: 4 }}
			>
				{items.map((item) => (
					<Pressable
						key={item.id}
						onPress={() => onItemPress?.(item)}
						className="mr-4"
					>
						<Card className="w-48 bg-card/50">
							<CardContent className="p-4">
								<View className="flex-row items-start justify-between mb-2">
									<View className="flex-1">
										<Text
											className="font-semibold text-foreground"
											numberOfLines={1}
										>
											{item.name}
										</Text>
										<Text className="text-sm text-muted-foreground mt-1">
											{item.category}
										</Text>
									</View>
									<Badge
										variant={getExpiryVariant(item.daysLeft)}
										className="ml-2"
									>
										<Text className="text-xs font-medium text-white">
											{item.daysLeft}d
										</Text>
									</Badge>
								</View>
								<View className="flex-row items-center mt-3">
									<CalendarIcon size={14} color="#6b7280" />
									<Text className="text-xs text-muted-foreground ml-2">
										{getExpiryText(item.daysLeft)}
									</Text>
								</View>
							</CardContent>
						</Card>
					</Pressable>
				))}
			</ScrollView>
		</View>
	);
}
