import React from "react";
import { Tabs } from "expo-router";
import { View, Platform } from "react-native";
import { Home, User, Plus, ShoppingBag } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NAV_THEME, THEME } from "@/lib/theme";
import { useCameraContext } from "@/context/camera-context";
import { useColorScheme } from "nativewind";

export default function TabsLayout() {
	const { colorScheme } = useColorScheme();

	const { isCameraOpen } = useCameraContext();
	const insets = useSafeAreaInsets();

	// Use theme colors for consistency
	const isDarkColorScheme = colorScheme === "dark";
	const currentTheme = isDarkColorScheme ? THEME.dark : THEME.light;
	const navTheme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;

	const tabBarStyle = React.useMemo(() => {
		if (isCameraOpen) {
			return { display: "none" as const };
		}

		return {
			paddingBottom: Platform.OS === "ios" ? insets.bottom : 8,
			height: Platform.OS === "ios" ? 80 + insets.bottom : 60,
			backgroundColor: currentTheme.background,
			borderTopColor: currentTheme.border,
			borderTopWidth: 0.5,
		};
	}, [isCameraOpen, insets.bottom, currentTheme]);

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle,
				tabBarActiveTintColor: currentTheme.primary,
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
								backgroundColor: currentTheme.primary,
								justifyContent: "center",
								alignItems: "center",
								marginBottom: Platform.OS === "ios" ? 20 : 16,
								shadowColor: currentTheme.primary,
								shadowOffset: { width: 0, height: 4 },
								shadowOpacity: 0.3,
								shadowRadius: 8,
								elevation: 8,
							}}
						>
							<Plus size={28} color={currentTheme.background} />
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
