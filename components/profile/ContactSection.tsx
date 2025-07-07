import { TouchableOpacity, View, Linking } from "react-native";
import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Text } from "../ui/text";
import { H3, H4, Muted } from "../ui/typography";
import { ChevronRight, Mail, Phone } from "lucide-react-native";

interface ContactSectionProps {
	supportEmail?: string;
	supportPhone?: string;
	onEmailPress?: () => void;
	onPhonePress?: () => void;
}

const ContactSection: React.FC<ContactSectionProps> = ({
	supportEmail = "mdatikmouhtasim@gmail.com",
	supportPhone = "+8801719345888",
	onEmailPress,
	onPhonePress,
}) => {
	const handleContactSupport = () => {
		if (onEmailPress) {
			onEmailPress();
		} else {
			Linking.openURL(`mailto:${supportEmail}?subject=WasteGuard Support`);
		}
	};

	const handlePhoneSupport = () => {
		if (onPhonePress) {
			onPhonePress();
		} else {
			Linking.openURL(`tel:${supportPhone}`);
		}
	};

	return (
		<Card className="mx-4 mb-4">
			<CardHeader>
				<H4 className="text-muted-foreground font-bold">Contact</H4>
			</CardHeader>

			<CardContent className="pt-0">
				<TouchableOpacity
					className="flex-row items-center justify-between py-3 border-b border-border"
					onPress={handleContactSupport}
				>
					<View className="flex-row items-center flex-1">
						<Mail size={20} className="text-gray-600 mr-3" />
						<Text className="text-foreground">Email Support</Text>
					</View>
					<ChevronRight size={20} className="text-muted-foreground" />
				</TouchableOpacity>

				<TouchableOpacity
					className="flex-row items-center justify-between py-3"
					onPress={handlePhoneSupport}
				>
					<View className="flex-row items-center flex-1">
						<Phone size={20} className="text-gray-600 mr-3" />
						<Text className="text-foreground">Phone Support</Text>
					</View>
					<ChevronRight size={20} className="text-muted-foreground" />
				</TouchableOpacity>
			</CardContent>
		</Card>
	);
};

export default ContactSection;
