import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/context/supabase-provider";

const Layout = () => {
	const { session } = useAuth();
	// console.log(session);

	if (session) {
		return <Redirect href="/home" />;
	}

	return (
		<Stack>
			<Stack.Screen
				name="sign-up"
				options={{
					headerShown: false,
					headerTitle: "Sign Up",
					// gestureEnabled: true,
					headerShadowVisible: false,
					headerBackground: () => null, // Disable default header background
				}}
			/>
			<Stack.Screen
				name="sign-in"
				options={{
					headerShown: false,
					headerTitle: "Sign In",
					gestureEnabled: true,
					headerShadowVisible: false,
					headerBackground: () => null, // Disable default header background
				}}
			/>
		</Stack>
	);
};

export default Layout;
