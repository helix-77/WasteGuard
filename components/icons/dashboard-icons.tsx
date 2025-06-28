import React from "react";
import { View } from "react-native";
import { cn } from "@/lib/utils";

interface IconProps {
	size?: number;
	className?: string;
}

// Clock Icon for expiring items
export const ClockIcon = ({ size = 24, className }: IconProps) => (
	<View className={cn("items-center justify-center", className)}>
		<View
			className="border-2 border-current rounded-full"
			style={{ width: size, height: size }}
		>
			<View
				className="absolute top-1/2 left-1/2 w-0.5 bg-current"
				style={{ height: size * 0.3, marginTop: -size * 0.3, marginLeft: -1 }}
			/>
			<View
				className="absolute top-1/2 left-1/2 h-0.5 bg-current"
				style={{ width: size * 0.2, marginTop: -1, marginLeft: -1 }}
			/>
		</View>
	</View>
);

// Leaf Icon for sustainability
export const LeafIcon = ({ size = 24, className }: IconProps) => (
	<View className={cn("items-center justify-center", className)}>
		<View
			className="bg-current rounded-full"
			style={{
				width: size * 0.8,
				height: size,
				transform: [{ rotate: "45deg" }],
			}}
		/>
		<View
			className="absolute bg-current"
			style={{
				width: 2,
				height: size * 0.4,
				bottom: 0,
				left: "50%",
				marginLeft: -1,
			}}
		/>
	</View>
);

// Plus Icon for adding items
export const PlusIcon = ({ size = 24, className }: IconProps) => (
	<View className={cn("items-center justify-center", className)}>
		<View className="bg-current" style={{ width: size * 0.8, height: 2 }} />
		<View
			className="absolute bg-current"
			style={{ width: 2, height: size * 0.8 }}
		/>
	</View>
);

// Chart Icon for stats
export const ChartIcon = ({ size = 24, className }: IconProps) => (
	<View
		className={cn("items-center justify-center flex-row items-end", className)}
	>
		<View
			className="bg-current mr-1"
			style={{ width: 3, height: size * 0.4 }}
		/>
		<View
			className="bg-current mr-1"
			style={{ width: 3, height: size * 0.7 }}
		/>
		<View
			className="bg-current mr-1"
			style={{ width: 3, height: size * 0.5 }}
		/>
		<View className="bg-current" style={{ width: 3, height: size * 0.8 }} />
	</View>
);

// Recipe Icon
export const RecipeIcon = ({ size = 24, className }: IconProps) => (
	<View className={cn("items-center justify-center", className)}>
		<View
			className="border-2 border-current rounded"
			style={{ width: size * 0.8, height: size }}
		>
			<View
				className="bg-current mx-auto mt-1"
				style={{ width: size * 0.5, height: 2 }}
			/>
			<View
				className="bg-current mx-auto mt-1"
				style={{ width: size * 0.4, height: 2 }}
			/>
			<View
				className="bg-current mx-auto mt-1"
				style={{ width: size * 0.6, height: 2 }}
			/>
		</View>
	</View>
);

// Alert Icon
export const AlertIcon = ({ size = 24, className }: IconProps) => (
	<View className={cn("items-center justify-center", className)}>
		<View
			className="border-2 border-current"
			style={{
				width: size * 0.8,
				height: size * 0.8,
				borderRadius: size * 0.1,
			}}
		>
			<View
				className="bg-current mx-auto mt-1"
				style={{ width: 2, height: size * 0.4 }}
			/>
			<View
				className="bg-current mx-auto mt-1 rounded-full"
				style={{ width: 3, height: 3 }}
			/>
		</View>
	</View>
);
