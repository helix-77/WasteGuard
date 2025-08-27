import React from "react";
import { ScrollView, View } from "react-native";
import { useAuth } from "@/context/supabase-provider";
import {
	ProfileHeader,
	PremiumSection,
	SettingsSection,
	ContactSection,
	SignOutButton,
	type PremiumFeature,
	type SettingsItem,
} from "@/components/profile";

import {
	User,
	Key,
	Info,
	Shield,
	TrendingUp,
	PlusCircle,
	PartyPopper,
	Users,
	Headphones,
	Heart,
} from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Profile: React.FC = () => {
	const { session, signOut } = useAuth();
	const insets = useSafeAreaInsets();

	// Extract user data from session
	const user = session?.user;
	const userName =
		user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
	const userEmail = user?.email || "No email";
	const userPlan = user?.user_metadata.plan || "Free Plan";

	// Premium features configuration - memoized for performance
	const premiumFeatures: PremiumFeature[] = React.useMemo(
		() => [
			{
				title: "Add Unlimited Items",
				description: "Add and manage unlimited products without any limits",
				icon: <Icon as={PlusCircle} size={20} className="text-blue-500" />,
			},
			{
				title: "Ad-Free Experience",
				description: "Enjoy a distraction-free interface",
				icon: <Icon as={PartyPopper} size={20} className="text-red-500" />,
			},
			{
				title: "Family Sharing",
				description: "Sync across multiple accounts/devices",
				icon: <Icon as={Users} size={20} className="text-purple-500" />,
			},
			{
				title: "Advanced Analytics",
				description: "Detailed waste reduction insights",
				icon: <Icon as={TrendingUp} size={20} className="text-green-600" />,
			},
			{
				title: "Priority Support",
				description: "Faster responses and feature requests prioritized",
				icon: <Icon as={Headphones} size={20} className="text-yellow-600" />,
			},
			{
				title: "Support the Developer",
				description: "Help maintain and improve the app",
				icon: <Icon as={Heart} size={20} className="text-orange-500" />,
			},
		],
		[],
	);

	// Settings items configuration - memoized for performance
	const settingsItems: SettingsItem[] = React.useMemo(
		() => [
			// {
			// 	title: "Appearance",
			// 	icon: <Blend size={20} className="text-foreground" />,
			// 	customAction: <ThemeToggle />,
			// 	showChevron: false,
			// },
			{
				title: "Edit Profile",
				icon: <Icon as={User} size={20} className="text-foreground" />,
				onPress: () => {
					router.push("/(protected)/profileScreens/editProfile");
				},
				showChevron: true,
			},
			{
				title: "Edit Login Credentials",
				icon: <Icon as={Key} size={20} className="text-foreground" />,
				onPress: () => {
					router.push("/(protected)/profileScreens/editCredentials");
				},
				showChevron: true,
			},
			{
				title: "About",
				icon: <Icon as={Info} size={20} className="text-foreground" />,
				onPress: () => {
					router.push("/(protected)/profileScreens/about");
				},
				showChevron: true,
			},
			{
				title: "Privacy Policy",
				icon: <Icon as={Shield} size={20} className="text-foreground" />,
				onPress: () => {
					router.push("/(protected)/profileScreens/privacyPolicy");
				},
				showChevron: true,
			},
		],
		[],
	);

	// Event handlers - memoized for performance
	const handlePremiumUpgrade = React.useCallback(() => {
		// TODO: Navigate to premium upgrade screen
		console.log("Premium upgrade pressed");
	}, []);

	const handleSignOut = React.useCallback(async () => {
		try {
			await signOut();
		} catch (error) {
			console.error("Error signing out:", error);
		}
	}, [signOut]);

	return (
		<View className="flex-1 bg-background">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{
					paddingTop: insets.top + 16,
					paddingBottom: insets.bottom + 16,
				}}
				showsVerticalScrollIndicator={false}
				// removeClippedSubviews={true} // Performance optimization
				// maxToRenderPerBatch={10} // Performance optimization
			>
				<ProfileHeader name={userName} email={userEmail} plan={userPlan} />

				<PremiumSection
					features={premiumFeatures}
					onUpgrade={handlePremiumUpgrade}
				/>

				<SettingsSection items={settingsItems} />

				<ContactSection />

				<View className="mb-6">
					<SignOutButton onSignOut={handleSignOut} />
				</View>
			</ScrollView>
		</View>
	);
};

export default Profile;
