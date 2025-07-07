import { View } from "react-native";
import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { H3, H4, Muted, Small } from "../ui/typography";
import { Crown } from "lucide-react-native";

export interface PremiumFeature {
	title: string;
	description: string;
	icon: React.ReactNode;
}

interface PremiumSectionProps {
	features?: PremiumFeature[];
	onUpgrade?: () => void;
}

const PremiumSection: React.FC<PremiumSectionProps> = ({
	onUpgrade,
	features,
}) => {
	const handleUpgrade = () => {
		if (onUpgrade) {
			onUpgrade();
		} else {
			console.log("Upgrade to premium pressed");
		}
	};

	// console.log(features);

	return (
		<Card className="mx-4 mb-4">
			<CardHeader>
				<View className="flex-row items-center justify-between">
					<H4 className="text-foreground font-bold">Upgrade to Premium</H4>
					<Crown size={24} color={"#eab308"} />
				</View>
				<Muted>Unlock advanced features and insights</Muted>
			</CardHeader>

			<CardContent className="pt-0">
				{features.map((feature, index) => (
					<View key={index} className="flex-row items-center pb-3 last:mb-0">
						<View className="mr-3">{feature.icon}</View>
						<View className="flex-1">
							<Text className="text-foreground text-sm font-medium">
								{feature.title}
							</Text>
							<Muted className="text-xs">{feature.description}</Muted>
						</View>
					</View>
				))}

				<Button
					variant={"glow"}
					size="sm"
					className="mt-2 flex-row items-center gap-2"
					onPress={handleUpgrade}
				>
					<Crown size={16} />
					<Text className="text-black font-medium">Upgrade Now</Text>
				</Button>
			</CardContent>
		</Card>
	);
};

export default PremiumSection;
