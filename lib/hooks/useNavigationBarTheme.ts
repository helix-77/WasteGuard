import { useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import { configureEdgeToEdge } from "@/lib/android-navigation-bar";

interface NavigationBarTheme {
	configureNavigationBar: () => Promise<void>;
	isConfigured: boolean;
}

export function useNavigationBarTheme(): NavigationBarTheme {
	const { colorScheme } = useColorScheme();
	const [isConfigured, setIsConfigured] = useState(false);

	const configureNavigationBar = async () => {
		try {
			await configureEdgeToEdge(colorScheme ?? "light");
			setIsConfigured(true);
		} catch (error) {
			console.warn("Failed to configure navigation bar theme:", error);
			setIsConfigured(false);
		}
	};

	useEffect(() => {
		configureNavigationBar();
	}, [colorScheme]);

	return {
		configureNavigationBar,
		isConfigured,
	};
}
