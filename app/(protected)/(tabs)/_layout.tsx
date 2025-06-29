import React from "react";
import { Tabs } from "expo-router";
import { View } from "react-native";
import {
	Home,
	User,
	Plus,
	ListChecks,
	ShoppingBasket,
	ShoppingBag,
} from "lucide-react-native";

import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

export default function TabsLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
			}}
		>
			<Tabs.Screen
				name="home"
				options={{
					title: "Home",
					tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="products"
				options={{
					title: "Products",
					tabBarIcon: ({ color, size }) => (
						<ShoppingBag size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="plusTab"
				options={{
					title: "",
					tabBarIcon: ({ color }) => (
						<View
							style={{
								width: 56,
								height: 56,
								borderRadius: 28,
								backgroundColor: colors[colorScheme].primary,
								justifyContent: "center",
								alignItems: "center",
								marginBottom: 20,
								shadowColor: colors[colorScheme].primary,
								shadowOffset: { width: 0, height: 4 },
								shadowOpacity: 0.3,
								shadowRadius: 8,
								elevation: 8,
							}}
						>
							<Plus size={28} color={colors[colorScheme].background} />
						</View>
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
				}}
			/>
		</Tabs>
	);
}
