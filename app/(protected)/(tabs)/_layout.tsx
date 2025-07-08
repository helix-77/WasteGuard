import React from "react";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { Home, User, Plus, ShoppingBag } from "lucide-react-native";

import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { useCameraContext } from "@/context/camera-context";

export default function TabsLayout() {
	const { colorScheme } = useColorScheme();
	const { isCameraOpen } = useCameraContext();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: isCameraOpen ? { display: "none" } : {},
				animation: "shift", // Tab animation
				transitionSpec: {
					animation: "timing",
					config: {
						duration: 250,
					},
				},
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
				name="products"
				options={{
					title: "Products",
					tabBarIcon: ({ color, size }) => (
						<ShoppingBag size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
