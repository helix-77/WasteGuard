import { View } from "react-native";
import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Text } from "../ui/text";

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

const PremiumSection: React.FC<PremiumSectionProps> = React.memo(
	({ onUpgrade, features }) => {
		const handleUpgrade = React.useCallback(() => {
			if (onUpgrade) {
				onUpgrade();
			}
		}, [onUpgrade]);

		return (
			<View className="px-4 mb-2">
				<Card className="shadow-sm">
					<CardHeader className="pb-4">
						<View className="flex-row items-center justify-between mb-2">
							<Text variant="h4" className="text-foreground font-bold">
								Upgrade to Premium
							</Text>
							<Crown size={24} color={"#eab308"} />
						</View>
						<Text variant="muted" className="text-sm">
							Unlock advanced features and insights
						</Text>
					</CardHeader>

					<CardContent className="pt-0">
						<View className="space-y-4 mb-6">
							{features?.map((feature, index) => (
								<View
									key={`feature-${index}`}
									className="flex-row items-start py-2"
								>
									<View className="mr-4 mt-0.5">{feature.icon}</View>
									<View className="flex-1">
										<Text className="text-foreground text-sm font-medium mb-1">
											{feature.title}
										</Text>
										<Text variant="muted" className="text-xs leading-4">
											{feature.description}
										</Text>
									</View>
								</View>
							))}
						</View>

						<Button
							variant={"glow"}
							size="lg"
							className="w-full flex-row items-center justify-center gap-2 py-4"
							onPress={handleUpgrade}
						>
							<Crown size={18} />
							<Text className="text-black font-semibold">Upgrade Now</Text>
						</Button>
					</CardContent>
				</Card>
			</View>
		);
	},
);

PremiumSection.displayName = "PremiumSection";

export default PremiumSection;
