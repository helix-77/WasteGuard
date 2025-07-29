import React, { useEffect } from "react";
import { View, Image } from "react-native";
import { H1, Muted } from "@/components/ui/typography";
import { useColorScheme } from "@/lib/useColorScheme";
import * as SplashScreen from "expo-splash-screen";

interface SplashScreenProps {
	onReady: () => void;
}

export function AppSplashScreen({ onReady }: SplashScreenProps) {
	const { colorScheme } = useColorScheme();

	// We define this but don't use it directly as it's handled by Expo
	const _splashImage =
		colorScheme === "dark"
			? require("@/assets/splash.png")
			: require("@/assets/splash.png");

	const appIcon =
		colorScheme === "dark"
			? require("@/assets/icon-dark.png")
			: require("@/assets/icon.png");

	useEffect(() => {
		// This effect will trigger when the component mounts, allowing for any animations
		// or additional loading checks before calling onReady
		const prepare = async () => {
			try {
				// Keep the splash screen visible while we fetch resources
				await SplashScreen.preventAutoHideAsync();

				// Artificial delay to ensure minimum display time if needed
				// await new Promise(resolve => setTimeout(resolve, 1000));
			} catch (e) {
				console.warn("Error preparing splash screen:", e);
			} finally {
				// Tell the parent component we're ready
				onReady();
			}
		};

		prepare();
	}, [onReady]);

	return (
		<View className="flex-1 items-center justify-center bg-background">
			<View className="items-center justify-center">
				<Image source={appIcon} className="w-24 h-24 rounded-xl mb-4" />
				<H1 className="text-foreground text-center mb-2">WasteGuard</H1>
				<Muted className="text-center px-8">Reduce waste, save resources</Muted>
			</View>
		</View>
	);
}
