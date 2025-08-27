import { TouchableOpacity, View } from "react-native";
import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Text } from "../ui/text";

import { ChevronRight } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";

export interface SettingsItem {
	title: string;
	icon: React.ReactNode;
	onPress?: () => void;
	showChevron?: boolean;
}

interface SettingsSectionProps {
	items: SettingsItem[];
}

const SettingsItem: React.FC<{
	item: SettingsItem;
	isLast: boolean;
}> = React.memo(({ item, isLast }) => (
	<TouchableOpacity
		className={`flex-row items-center justify-between py-4 ${
			!isLast ? "border-b border-border/50" : ""
		}`}
		onPress={item.onPress}
		disabled={!item.onPress}
		activeOpacity={0.7}
	>
		<View className="flex-row items-center flex-1">
			<View className="mr-4 w-6 items-center">{item.icon}</View>
			<Text className="text-foreground text-base">{item.title}</Text>
		</View>

		<View className="flex-row items-center">
			{item.showChevron ? (
				<Icon as={ChevronRight} size={20} className="text-muted-foreground" />
			) : null}
		</View>
	</TouchableOpacity>
));

SettingsItem.displayName = "SettingsItem";

const SettingsSection: React.FC<SettingsSectionProps> = React.memo(
	({ items }) => {
		return (
			<View className="px-4 pb-2">
				<Card className="shadow-sm">
					<CardHeader className="pb-2">
						<Text variant="h4" className="text-foreground font-bold">
							Settings
						</Text>
					</CardHeader>

					<CardContent className="pt-0">
						{items.map((item, index) => (
							<SettingsItem
								key={`setting-${index}-${item.title}`}
								item={item}
								isLast={index === items.length - 1}
							/>
						))}
					</CardContent>
				</Card>
			</View>
		);
	},
);

SettingsSection.displayName = "SettingsSection";

export default SettingsSection;
