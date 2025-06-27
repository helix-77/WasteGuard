import React from "react";
import { Tabs } from "expo-router";

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
			<Tabs.Screen name="index" options={{ title: "Home" }} />
			<Tabs.Screen name="settings" options={{ title: "Profile" }} />
			<Tabs.Screen
				name="plus"
				options={{
					title: "Plus",
					tabBarActiveTintColor: colors[colorScheme].primary,
				}}
			/>
		</Tabs>
	);
}
