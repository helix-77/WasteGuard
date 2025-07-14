import "../global.css";

import { Stack } from "expo-router";

import { AuthProvider } from "@/context/supabase-provider";
import { useColorScheme } from "@/lib/useColorScheme";

import {
	Theme,
	ThemeProvider,
	DefaultTheme,
	DarkTheme,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";

import { NAV_THEME } from "../lib/constants";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppSplashScreen } from "@/components/AppSplashScreen";

// Keep the splash screen visible until we're ready to render
SplashScreen.preventAutoHideAsync();

const LIGHT_THEME: Theme = {
	...DefaultTheme,
	colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
	...DarkTheme,
	colors: NAV_THEME.dark,
};

// Define the isomorphic layout effect once
const useIsomorphicLayoutEffect =
	Platform.OS === "web" && typeof window === "undefined"
		? React.useEffect
		: React.useLayoutEffect;

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from "expo-router";

export default function RootLayout() {
	const hasMounted = React.useRef(false);
	const { isDarkColorScheme } = useColorScheme();
	const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
	const [appIsReady, setAppIsReady] = React.useState(false);

	useIsomorphicLayoutEffect(() => {
		if (hasMounted.current) {
			return;
		}

		if (Platform.OS === "web") {
			// Adds the background color to the html element to prevent white background on overscroll.
			document.documentElement.classList.add("bg-background");
		}
		setIsColorSchemeLoaded(true);
		hasMounted.current = true;
	}, []);

	const onLayoutRootView = React.useCallback(() => {
		if (appIsReady && isColorSchemeLoaded) {
			// This tells the splash screen to hide immediately
			SplashScreen.hideAsync();
		}
	}, [appIsReady, isColorSchemeLoaded]);

	if (!isColorSchemeLoaded) {
		return null;
	}

	if (!appIsReady) {
		return (
			<AppSplashScreen
				onReady={() => {
					setAppIsReady(true);
				}}
			/>
		);
	}

	return (
		<AuthProvider>
			<GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
				<ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
					<StatusBar style={isDarkColorScheme ? "light" : "dark"} />
					<Stack screenOptions={{ headerShown: false }}>
						<Stack.Screen name="welcome" />
						<Stack.Screen name="(auth)" />
						<Stack.Screen name="(protected)" />
					</Stack>
				</ThemeProvider>
			</GestureHandlerRootView>
		</AuthProvider>
	);
}
