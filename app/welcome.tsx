import React, { useEffect, useState } from "react";
import { View, Animated } from "react-native";
import { useRouter } from "expo-router";

import { Image } from "@/components/image";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useColorScheme } from "@/lib/useColorScheme";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function WelcomeScreen() {
	const router = useRouter();
	const [fadeAnim] = useState(new Animated.Value(0));
	const [slideAnim] = useState(new Animated.Value(50));

	const { colorScheme } = useColorScheme();
	const appIcon =
		colorScheme === "dark"
			? require("@/assets/icon.png")
			: require("@/assets/icon.png");

	useEffect(() => {
		// Start animations when component mounts
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 800,
				useNativeDriver: true,
			}),
			Animated.timing(slideAnim, {
				toValue: 0,
				duration: 800,
				useNativeDriver: true,
			}),
		]).start();
	}, [fadeAnim, slideAnim]);

	return (
		<SafeAreaView className="flex flex-1 bg-background p-4">
			<Animated.View
				style={{
					opacity: fadeAnim,
					transform: [{ translateY: slideAnim }],
				}}
				className="flex flex-1"
			>
				<View className="flex flex-row gap-2 justify-end pr-4">
					<Muted> Change Theme</Muted>
					<ThemeToggle />
				</View>
				<View className="flex flex-1 items-center justify-center gap-y-4 web:m-4">
					<Image source={appIcon} className="w-16 h-16 rounded-xl" />
					<H1 className="text-center">WasteGuard</H1>
					<Muted className="text-center">
						An App that help users reduce food, grocery and cosmetics waste by
						tracking expiry dates, suggesting better usage and recipes, and
						managing pantry inventory.
					</Muted>
				</View>
				<View className="flex flex-col gap-y-4 web:m-4">
					<Button
						size="default"
						variant="default"
						onPress={() => {
							router.push("/sign-up");
						}}
					>
						<Text>Sign Up</Text>
					</Button>
					<Button
						size="default"
						variant="secondary"
						onPress={() => {
							router.push("/sign-in");
						}}
					>
						<Text>Sign In</Text>
					</Button>
				</View>
			</Animated.View>
		</SafeAreaView>
	);
}
