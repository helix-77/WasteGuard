import * as NavigationBar from "expo-navigation-bar";
import { Platform } from "react-native";

export async function setAndroidNavigationBar(theme: "light" | "dark") {
	if (Platform.OS !== "android") return;

	try {
		// Only set button style for edge-to-edge compatibility
		await NavigationBar.setButtonStyleAsync(
			theme === "dark" ? "light" : "dark",
		);
	} catch (error) {
		console.warn("Failed to set navigation bar button style:", error);
	}
}
