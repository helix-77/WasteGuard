import "../global.css";

import { AuthProvider } from "@/context/supabase-provider";
import { QueryProvider } from "@/lib/providers/query-provider";
import { Platform } from "react-native";

import {
	Theme,
	ThemeProvider,
	DefaultTheme,
	DarkTheme,
} from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { HeaderRightView } from "@/components/header-right-view";

import { NAV_THEME } from "@/lib/theme";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import * as React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { AppSplashScreen } from "@/components/AppSplashScreen";
import { Text } from "@/components/ui/text";

// Keep the splash screen visible until we're ready to render
SplashScreen.preventAutoHideAsync();

// Memoize themes for performance
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

export const unstable_settings = {
	// Ensure that reloading on `/modal` keeps a back button present.
	initialRouteName: "index",
};

export default function RootLayout() {
	const hasMounted = React.useRef(false);
	const { colorScheme } = useColorScheme();
	const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
	const [appIsReady, setAppIsReady] = React.useState(false);

	// Memoize theme selection for performance
	const theme = React.useMemo(
		() => (colorScheme === "dark" ? DARK_THEME : LIGHT_THEME),
		[colorScheme],
	);

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

	const handleAppReady = React.useCallback(() => {
		setAppIsReady(true);
	}, []);

	if (!isColorSchemeLoaded) {
		return null;
	}

	if (!appIsReady) {
		return <AppSplashScreen onReady={handleAppReady} />;
	}

	return (
		<QueryProvider>
			<AuthProvider>
				<ThemeProvider value={theme}>
					<StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
					<GestureHandlerRootView
						style={{
							flex: 1,
							backgroundColor: theme.colors.background,
						}}
						onLayout={onLayoutRootView}
					>
						<KeyboardProvider>
							<Stack
								screenOptions={{
									headerShown: false,
									animation: "slide_from_right",
									animationDuration: 200, // Faster navigation
									headerBackTitle: "Back",
									// headerTitle(props) {
									// 	return (
									// 		<Text className="ios:font-medium android:mt-1.5 text-xl">
									// 			{toOptions(props.children.split("/").pop())}
									// 		</Text>
									// 	);
									// },
									// headerRight: () => <HeaderRightView />,
								}}
							>
								<Stack.Screen
									name="welcome"
									options={{
										animation: "fade",
										gestureEnabled: false,
									}}
								/>
								<Stack.Screen
									name="(auth)"
									options={{
										animation: "slide_from_right",
										gestureEnabled: false,
									}}
								/>
								<Stack.Screen
									name="(protected)"
									options={{
										animation: "slide_from_right",
										gestureEnabled: false,
									}}
								/>
							</Stack>
							<PortalHost />
						</KeyboardProvider>
					</GestureHandlerRootView>
				</ThemeProvider>
			</AuthProvider>
		</QueryProvider>
	);
}

function toOptions(name: string) {
	const title = name
		.split("-")
		.map(function (str: string) {
			return str.replace(/\b\w/g, function (char) {
				return char.toUpperCase();
			});
		})
		.join(" ");
	return title;
}
