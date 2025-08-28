import * as NavigationBar from "expo-navigation-bar";
import { Platform } from "react-native";

export async function setAndroidNavigationBar(theme: "light" | "dark") {
	if (Platform.OS !== "android") return;

	try {
		// Set button style for edge-to-edge compatibility
		await NavigationBar.setButtonStyleAsync(
			theme === "dark" ? "light" : "dark",
		);
	} catch (error) {
		console.warn("Failed to set navigation bar button style:", error);
	}
}

export async function setAndroidNavigationBarBackground(
	backgroundColor: string,
) {
	if (Platform.OS !== "android") return;

	try {
		await NavigationBar.setBackgroundColorAsync(backgroundColor);
	} catch (error) {
		console.warn("Failed to set navigation bar background:", error);
	}
}

export async function configureEdgeToEdge(theme: "light" | "dark") {
	if (Platform.OS !== "android") return;

	try {
		// Only set button style for edge-to-edge compatibility
		// Don't set background color when edge-to-edge is enabled
		await NavigationBar.setButtonStyleAsync(
			theme === "dark" ? "light" : "dark",
		);
	} catch (error) {
		console.warn("Failed to configure edge-to-edge navigation:", error);
	}
}
