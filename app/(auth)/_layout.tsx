import { Redirect, Stack } from "expo-router";

const Layout = () => {
	// const { isAuthenticated } = useAuth();

	// if (isAuthenticated) {
	// 	return <Redirect href="/(tabs)/home" />;
	// }
	return (
		<Stack>
			<Stack.Screen
				name="sign-up"
				options={{
					headerShown: true,
					headerTitle: "Sign Up",
					gestureEnabled: true,
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
