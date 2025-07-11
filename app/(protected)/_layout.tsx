import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/context/supabase-provider";
import { CameraProvider } from "@/context/camera-context";

export const unstable_settings = {
	initialRouteName: "(tabs)",
};

export default function ProtectedLayout() {
	const { initialized, session } = useAuth();

	if (!initialized) {
		return null;
	}

	if (!session) {
		return <Redirect href="/welcome" />;
	}

	return (
		<CameraProvider>
			<Stack>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen
					name="profileScreens"
					options={{
						headerShown: false,
					}}
				/>
				<Stack.Screen
					name="profile"
					options={{
						headerShown: true,
						title: "Profile",
						headerBackVisible: true,
						headerShadowVisible: false,
						headerBackTitle: "Back",
						animation: "slide_from_bottom",
						headerBackground: () => null, // Disable default header background
					}}
				/>
			</Stack>
		</CameraProvider>
	);
}
