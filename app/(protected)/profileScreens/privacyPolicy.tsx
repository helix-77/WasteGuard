import { View, ScrollView } from "react-native";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

import { useSafeAreaInsets } from "react-native-safe-area-context";

const PrivacyPolicy = () => {
	const insets = useSafeAreaInsets();

	const sections = [
		{
			title: "Information We Collect",
			content:
				"We collect information you provide directly to us, such as when you create an account, add products to your inventory, or contact us for support. This may include your name, email address, and product information.",
		},
		{
			title: "How We Use Your Information",
			content:
				"We use the information we collect to provide, maintain, and improve our services, send you notifications about expiring products, and communicate with you about your account.",
		},
		{
			title: "Information Sharing",
			content:
				"We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this privacy policy or as required by law.",
		},
		{
			title: "Data Security",
			content:
				"We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
		},
		{
			title: "Data Retention",
			content:
				"We retain your information for as long as your account is active or as needed to provide you services. You may delete your account at any time.",
		},
		{
			title: "Your Rights",
			content:
				"You have the right to access, update, or delete your personal information. You can do this through your account settings or by contacting us directly.",
		},
	];

	return (
		<View className="flex-1 bg-background">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{
					paddingTop: 16,
					paddingBottom: insets.bottom + 16,
				}}
				showsVerticalScrollIndicator={false}
			>
				<View className="px-4">
					{/* Header */}
					<Card className="shadow-sm mb-6">
						<CardHeader>
							<Text variant="h4" className="text-foreground font-bold text-xl">
								Privacy Policy
							</Text>
							<Text variant="muted" className="text-sm">
								Last updated: January 2024
							</Text>
						</CardHeader>

						<CardContent>
							<Text className="text-foreground leading-6">
								Your privacy is important to us. This Privacy Policy explains
								how WasteGuard collects, uses, and protects your information
								when you use our application.
							</Text>
						</CardContent>
					</Card>

					{/* Sections */}
					{sections.map((section, index) => (
						<Card key={index} className="shadow-sm mb-4">
							<CardHeader>
								<Text variant="h4" className="text-foreground font-semibold">
									{section.title}
								</Text>
							</CardHeader>

							<CardContent>
								<Text className="text-foreground leading-6">
									{section.content}
								</Text>
							</CardContent>
						</Card>
					))}

					{/* Contact */}
					<Card className="shadow-sm">
						<CardHeader>
							<Text variant="h4" className="text-foreground font-semibold">
								Contact Us
							</Text>
						</CardHeader>

						<CardContent>
							<Text className="text-foreground leading-6">
								If you have any questions about this Privacy Policy, please
								contact us at:
							</Text>
							<Text className="text-primary font-medium mt-2">
								mdatikmouhtasim@gmail.com
							</Text>
						</CardContent>
					</Card>
				</View>
			</ScrollView>
		</View>
	);
};

export default PrivacyPolicy;
