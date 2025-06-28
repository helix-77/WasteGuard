import React from "react";
import { View, Pressable } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface StatsCardProps {
	title: string;
	value: string | number;
	description?: string;
	variant?: "default" | "success" | "warning" | "destructive";
	onPress?: () => void;
}

const variantStyles = {
	default: {
		card: " bg-card",
		value: "text-foreground",
		title: "text-muted-foreground",
	},
	success: {
		card: "bg-green-50  dark:bg-green-950",
		value: "text-green-900 dark:text-green-100",
		title: "text-green-700 dark:text-green-300",
	},
	warning: {
		card: "bg-yellow-50  dark:bg-yellow-950",
		value: "text-yellow-900 dark:text-yellow-100",
		title: "text-yellow-700 dark:text-yellow-300",
	},
	destructive: {
		card: " bg-red-50  dark:bg-red-950",
		value: "text-red-900 dark:text-red-100",
		title: "text-red-700 dark:text-red-300",
	},
};

export function StatsCard({
	title,
	value,
	description,
	variant = "default",
	onPress,
}: StatsCardProps) {
	const styles = variantStyles[variant];

	const content = (
		<Card className={cn("", styles.card)}>
			<CardContent className="p-4">
				<View className="flex-row items-center justify-between">
					<View className="flex-1">
						<Text className={cn("text-sm font-medium", styles.title)}>
							{title}
						</Text>
						<Text className={cn("text-2xl font-bold mt-1", styles.value)}>
							{value}
						</Text>
						{description && (
							<Text className="text-xs mt-1 text-foreground/50">
								{description}
							</Text>
						)}
					</View>
				</View>
			</CardContent>
		</Card>
	);

	if (onPress) {
		return (
			<Pressable onPress={onPress} className="flex-1">
				{content}
			</Pressable>
		);
	}

	return <View className="flex-1">{content}</View>;
}
