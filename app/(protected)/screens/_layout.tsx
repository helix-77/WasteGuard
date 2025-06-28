import { router, Stack } from "expo-router";

const Layout = () => {
	return (
		<Stack>
			<Stack.Screen
				name="productList"
				options={{
					headerShown: true,
					headerTitle: "Products",
					// headerBackTitle: "Back",
					headerShadowVisible: false,
				}}
			/>
		</Stack>
	);
};

export default Layout;
