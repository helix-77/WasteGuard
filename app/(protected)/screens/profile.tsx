import React from "react";
import { ScrollView } from "react-native";
import { useAuth } from "@/context/supabase-provider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
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
	Blend,
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
} from "@/lib/icons/profileIcons";

const Profile: React.FC = () => {
	const { session, signOut } = useAuth();

	// Extract user data from session
	const user = session?.user;
	const userName =
		user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
	const userEmail = user?.email || "No email";
	const userPlan = user?.user_metadata.plan || "Free Plan";

	// Premium features configuration
	const premiumFeatures: PremiumFeature[] = [
		{
			title: "Add Unlimited Items",
			description: "Add and manage unlimited products without any limits",
			icon: <PlusCircle size={20} className="text-blue-500" />,
		},
		{
			title: "Ad-Free Experience",
			description: "Enjoy a distraction-free interface",
			icon: <PartyPopper size={20} className="text-red-500" />,
		},
		{
			title: "Family Sharing",
			description: "Sync across multiple accounts/devices",
			icon: <Users size={20} className="text-purple-500" />,
		},
		{
			title: "Advanced Analytics",
			description: "Detailed waste reduction insights",
			icon: <TrendingUp size={20} className="text-green-600" />,
		},
		{
			title: "Priority Support",
			description: "Faster responses and feature requests prioritized",
			icon: <Headphones size={20} className="text-yellow-600" />,
		},

		{
			title: "Support the Developer",
			description: "Help maintain and improve the app",
			icon: <Heart size={20} className="text-orange-500" />,
		},
	];

	// Settings items configuration
	const settingsItems: SettingsItem[] = [
		{
			title: "Appearance",
			icon: <Blend size={20} className="text-foreground" />,
			customAction: <ThemeToggle />,
			showChevron: false,
		},
		{
			title: "Edit Profile",
			icon: <User size={20} className="text-foreground" />,
			onPress: () => {
				// TODO: Navigate to edit profile screen
				console.log("Edit profile pressed");
			},
			showChevron: true,
		},
		{
			title: "Edit Login Credentials",
			icon: <Key size={20} className="text-foreground" />,
			onPress: () => {
				// TODO: Navigate to credentials edit screen
				console.log("Edit credentials pressed");
			},
			showChevron: true,
		},
		{
			title: "About",
			icon: <Info size={20} className="text-foreground" />,
			onPress: () => {
				// TODO: Navigate to about screen
				console.log("About pressed");
			},
			showChevron: true,
		},
		{
			title: "Privacy Policy",
			icon: <Shield size={20} className="text-foreground" />,
			onPress: () => {
				// TODO: Navigate to privacy policy screen
				console.log("Privacy policy pressed");
			},
			showChevron: true,
		},
	];

	// Event handlers
	const handlePremiumUpgrade = () => {
		// TODO: Navigate to premium upgrade screen
		console.log("Premium upgrade pressed");
	};

	const handleSignOut = async () => {
		try {
			await signOut();
		} catch (error) {
			console.error("Error signing out:", error);
		}
	};

	return (
		<ScrollView className="flex-1 mt-6 mb-6">
			<ProfileHeader name={userName} email={userEmail} plan={userPlan} />

			<PremiumSection
				features={premiumFeatures}
				onUpgrade={handlePremiumUpgrade}
			/>

			<SettingsSection items={settingsItems} />

			<ContactSection />

			<SignOutButton onSignOut={handleSignOut} />
		</ScrollView>
	);
};

export default Profile;
