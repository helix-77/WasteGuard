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
					headerShown: true,
					headerTitle: "Sign Up",
					// gestureEnabled: true,
					headerShadowVisible: false,
				}}
			/>
			<Stack.Screen
				name="sign-in"
				options={{
					headerShown: true,
					headerTitle: "Sign In",
					gestureEnabled: true,
					headerShadowVisible: false,
				}}
			/>
		</Stack>
	);
};

export default Layout;
