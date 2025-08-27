import { View, ScrollView } from "react-native";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Leaf, Target, Users, Award } from "lucide-react-native";

const About = () => {
	const insets = useSafeAreaInsets();

	const features = [
		{
			icon: <Leaf size={24} className="text-green-500" />,
			title: "Reduce Food Waste",
			description:
				"Track expiration dates and get timely reminders to use products before they expire.",
		},
		{
			icon: <Target size={24} className="text-blue-500" />,
			title: "Smart Organization",
			description:
				"Organize your pantry, fridge, and freezer with intelligent categorization.",
		},
		{
			icon: <Users size={24} className="text-purple-500" />,
			title: "Family Sharing",
			description:
				"Share your inventory with family members and coordinate grocery shopping.",
		},
		{
			icon: <Award size={24} className="text-orange-500" />,
			title: "Sustainability Goals",
			description:
				"Track your waste reduction progress and achieve sustainability milestones.",
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
					{/* App Info */}
					<Card className="shadow-sm mb-6">
						<CardHeader className="items-center py-8">
							<View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center mb-4">
								<Leaf size={32} className="text-white" />
							</View>
							<Text variant="h4" className="text-foreground font-bold text-xl">
								WasteGuard
							</Text>
							<Text variant="muted" className="text-center mt-2">
								Version 1.0.0
							</Text>
						</CardHeader>

						<CardContent>
							<Text className="text-foreground text-center leading-6">
								WasteGuard helps you reduce food waste by tracking expiration
								dates, organizing your inventory, and providing smart reminders
								to use products before they expire.
							</Text>
						</CardContent>
					</Card>

					{/* Features */}
					<Card className="shadow-sm mb-6">
						<CardHeader>
							<Text variant="h4" className="text-foreground font-bold">
								Key Features
							</Text>
						</CardHeader>

						<CardContent>
							{features.map((feature, index) => (
								<View
									key={index}
									className={`flex-row items-start py-4 ${
										index < features.length - 1
											? "border-b border-border/50"
											: ""
									}`}
								>
									<View className="mr-4 mt-1">{feature.icon}</View>
									<View className="flex-1">
										<Text className="text-foreground font-medium mb-1">
											{feature.title}
										</Text>
										<Text variant="muted" className="text-sm leading-5">
											{feature.description}
										</Text>
									</View>
								</View>
							))}
						</CardContent>
					</Card>

					{/* Developer Info */}
					<Card className="shadow-sm">
						<CardHeader>
							<Text variant="h4" className="text-foreground font-bold">
								Developer
							</Text>
						</CardHeader>

						<CardContent>
							<Text className="text-foreground mb-2">
								Developed with ❤️ by MD Atik Mouhtasim Rahi
							</Text>
							<Text variant="muted" className="text-sm leading-5">
								Passionate about creating sustainable solutions that help reduce
								food waste and promote environmental consciousness.
							</Text>
						</CardContent>
					</Card>
				</View>
			</ScrollView>
		</View>
	);
};

export default About;
