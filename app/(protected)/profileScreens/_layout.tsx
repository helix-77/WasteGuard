import { ChevronLeft } from "@/lib/icons/profileIcons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity, Text } from "react-native";

const ScreenLayout = () => {
	const router = useRouter();

	const CustomBackButton = () => (
		<TouchableOpacity
			className="flex flex-row items-center"
			onPress={() => router.back()}
		>
			<ChevronLeft size={24} strokeWidth={2.6} className="text-primary" />
			<Text className="text-primary text-lg">Back</Text>
		</TouchableOpacity>
	);

	return (
		<Stack
			screenOptions={{
				headerShown: true,
				headerShadowVisible: false,
				animation: "ios_from_left",
				headerBackground: () => null, // Disable default header background
				headerLeft: () => <CustomBackButton />, // Custom back button
			}}
		>
			<Stack.Screen
				name="editProfile"
				options={{
					title: "Edit Profile",
					// headerTitle: "Edit Profile",
				}}
			/>
			<Stack.Screen
				name="about"
				options={{
					headerTitle: "About",
				}}
			/>
			<Stack.Screen
				name="privacyPolicy"
				options={{
					headerTitle: "Privacy Policy",
				}}
			/>

			<Stack.Screen
				name="editCredentials"
				options={{
					headerTitle: "Credentials",
				}}
			/>
		</Stack>
	);
};

export default ScreenLayout;
