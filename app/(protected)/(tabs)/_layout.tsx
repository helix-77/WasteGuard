import React from "react";
import { Tabs } from "expo-router";
import { View, Platform } from "react-native";
import { Home, User, Plus, ShoppingBag } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColorScheme } from "@/lib/useColorScheme";
import { NAV_THEME } from "@/lib/constants";
import { useCameraContext } from "@/context/camera-context";

export default function TabsLayout() {
	const { isDarkColorScheme } = useColorScheme();
	const { isCameraOpen } = useCameraContext();
	const insets = useSafeAreaInsets();

	// Use navigation theme colors for consistency
	const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;

	const tabBarStyle = React.useMemo(() => {
		if (isCameraOpen) {
			return { display: "none" as const };
		}

		return {
			paddingBottom: Platform.OS === "ios" ? insets.bottom : 8,
			height: Platform.OS === "ios" ? 80 + insets.bottom : 60,
			backgroundColor: theme.background,
			borderTopColor: theme.border,
			borderTopWidth: 0.5,
		};
	}, [isCameraOpen, insets.bottom, theme]);

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle,
				tabBarActiveTintColor: theme.primary,
				tabBarInactiveTintColor: isDarkColorScheme ? "#6B7280" : "#9CA3AF",
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: "500",
					marginTop: 4,
				},
				// Optimize performance
				lazy: true,
				tabBarHideOnKeyboard: true,
				animation: "shift",
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
					tabBarIcon: () => (
						<View
							style={{
								width: 56,
								height: 56,
								borderRadius: 28,
								backgroundColor: theme.primary,
								justifyContent: "center",
								alignItems: "center",
								marginBottom: Platform.OS === "ios" ? 20 : 16,
								shadowColor: theme.primary,
								shadowOffset: { width: 0, height: 4 },
								shadowOpacity: 0.3,
								shadowRadius: 8,
								elevation: 8,
							}}
						>
							<Plus size={28} color={theme.background} />
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

			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					href: null,
					tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
				}}
			/>
		</Tabs>
	);
}
