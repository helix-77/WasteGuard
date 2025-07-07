import { TouchableOpacity, View } from "react-native";
import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Text } from "../ui/text";
import { H3, H4 } from "../ui/typography";
import { ChevronRight } from "@/lib/icons/profileIcons";

export interface SettingsItem {
	title: string;
	icon: React.ReactNode;
	onPress?: () => void;
	showChevron?: boolean;
	customAction?: React.ReactNode;
}

interface SettingsSectionProps {
	items: SettingsItem[];
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ items }) => {
	return (
		<Card className="mx-4 mb-4">
			<CardHeader>
				<H4 className="text-muted-foreground font-bold">Settings</H4>
			</CardHeader>

			<CardContent className="pt-0">
				{items.map((item, index) => (
					<TouchableOpacity
						key={index}
						className="flex-row items-center justify-between py-3 border-b border-border last:border-b-0"
						onPress={item.onPress}
						disabled={!item.onPress}
					>
						<View className="flex-row items-center flex-1">
							<View className="mr-3">{item.icon}</View>
							<Text className="text-foreground">{item.title}</Text>
						</View>

						{item.customAction ? (
							item.customAction
						) : item.showChevron ? (
							<ChevronRight size={20} className="text-muted-foreground" />
						) : null}
					</TouchableOpacity>
				))}
			</CardContent>
		</Card>
	);
};

export default SettingsSection;
