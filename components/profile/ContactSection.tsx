import { TouchableOpacity, View, Linking } from "react-native";
import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Text } from "../ui/text";

import { ChevronRight, Mail, Phone } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";

interface ContactSectionProps {
	supportEmail?: string;
	supportPhone?: string;
	onEmailPress?: () => void;
	onPhonePress?: () => void;
}

const ContactSection: React.FC<ContactSectionProps> = React.memo(
	({
		supportEmail = "mdatikmouhtasim@gmail.com",
		supportPhone = "+8801719345888",
		onEmailPress,
		onPhonePress,
	}) => {
		const handleContactSupport = React.useCallback(() => {
			if (onEmailPress) {
				onEmailPress();
			} else {
				Linking.openURL(`mailto:${supportEmail}?subject=WasteGuard Support`);
			}
		}, [onEmailPress, supportEmail]);

		const handlePhoneSupport = React.useCallback(() => {
			if (onPhonePress) {
				onPhonePress();
			} else {
				Linking.openURL(`tel:${supportPhone}`);
			}
		}, [onPhonePress, supportPhone]);

		return (
			<View className="px-4 mb-3">
				<Card className="shadow-sm">
					<CardHeader className="pb-2">
						<Text variant="h4" className="text-foreground font-bold">
							Contact
						</Text>
					</CardHeader>

					<CardContent className="pt-0">
						<TouchableOpacity
							className="flex-row items-center justify-between py-4 border-b border-border/50"
							onPress={handleContactSupport}
							activeOpacity={0.7}
						>
							<View className="flex-row items-center flex-1">
								<View className="mr-4 w-6 items-center">
									<Icon as={Mail} size={20} className="text-foreground" />
								</View>
								<Text className="text-foreground text-base">Email Support</Text>
							</View>
							<Icon
								as={ChevronRight}
								size={20}
								className="text-muted-foreground"
							/>
						</TouchableOpacity>

						<TouchableOpacity
							className="flex-row items-center justify-between py-4"
							onPress={handlePhoneSupport}
							activeOpacity={0.7}
						>
							<View className="flex-row items-center flex-1">
								<View className="mr-4 w-6 items-center">
									<Icon as={Phone} size={20} className="text-foreground" />
								</View>
								<Text className="text-foreground text-base">Phone Support</Text>
							</View>
							<Icon
								as={ChevronRight}
								size={20}
								className="text-muted-foreground"
							/>
						</TouchableOpacity>
					</CardContent>
				</Card>
			</View>
		);
	},
);

ContactSection.displayName = "ContactSection";

export default ContactSection;
