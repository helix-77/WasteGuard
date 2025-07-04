import { Stack } from "expo-router";

const Layout = () => {
	return (
		<Stack>
			<Stack.Screen
				name="profile"
				options={{
					headerShown: false,
					headerTitle: "Profile",
					headerShadowVisible: false,
					// headerStyle: {
					// 	backgroundColor: "#fff",
					// },
				}}
			/>
		</Stack>
	);
};

export default Layout;
