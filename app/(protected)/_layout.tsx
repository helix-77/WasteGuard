import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/context/supabase-provider";
import { CameraProvider } from "@/context/camera-context";
import React from "react";

export const unstable_settings = {
	initialRouteName: "(tabs)",
};

export default function ProtectedLayout() {
	const { initialized, session } = useAuth();

	// Show loading state while checking auth
	if (!initialized) {
		return null;
	}

	// Redirect to welcome if not authenticated
	if (!session) {
		return <Redirect href="/welcome" />;
	}

	return (
		<CameraProvider>
			<Stack
				screenOptions={{
					headerShown: false,
					animation: "slide_from_right",
					animationDuration: 200, // Faster animations
				}}
			>
				<Stack.Screen
					name="(tabs)"
					options={{
						headerShown: false,
						gestureEnabled: false, // Disable swipe back on tabs
					}}
				/>
				<Stack.Screen
					name="profileScreens"
					options={{
						headerShown: false,
						presentation: "card",
						animation: "slide_from_right",
					}}
				/>
			</Stack>
		</CameraProvider>
	);
}
