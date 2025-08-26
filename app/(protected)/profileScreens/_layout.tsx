import { ChevronLeft } from "@/lib/icons/profileIcons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ScreenLayout = () => {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const CustomBackButton = () => (
		<TouchableOpacity
			className="flex flex-row items-center py-2 px-1"
			onPress={() => router.back()}
			activeOpacity={0.7}
		>
			<ChevronLeft size={24} strokeWidth={2.5} className="text-primary" />
			<Text className="text-primary text-base font-medium ml-1">Back</Text>
		</TouchableOpacity>
	);

	const CustomHeader = ({ title }: { title: string }) => (
		<View
			className="bg-background border-b border-border/50"
			style={{ paddingTop: insets.top }}
		>
			<View className="flex-row items-center justify-between px-4 py-3">
				<CustomBackButton />
				<Text className="text-foreground text-lg font-semibold flex-1 text-center mr-16">
					{title}
				</Text>
			</View>
		</View>
	);

	return (
		<Stack
			screenOptions={{
				headerShown: true,
				headerShadowVisible: false,
				animation: "slide_from_right",
				headerStyle: {
					backgroundColor: "transparent",
				},
				headerTitleStyle: {
					fontSize: 18,
					fontWeight: "600",
				},
				headerLeft: () => <CustomBackButton />,
				headerTitleAlign: "center",
			}}
		>
			<Stack.Screen
				name="editProfile"
				options={{
					headerTitle: "Edit Profile",
					presentation: "card",
				}}
			/>
			<Stack.Screen
				name="about"
				options={{
					headerTitle: "About",
					presentation: "card",
				}}
			/>
			<Stack.Screen
				name="privacyPolicy"
				options={{
					headerTitle: "Privacy Policy",
					presentation: "card",
				}}
			/>
			<Stack.Screen
				name="editCredentials"
				options={{
					headerTitle: "Edit Credentials",
					presentation: "card",
				}}
			/>
		</Stack>
	);
};

export default ScreenLayout;
