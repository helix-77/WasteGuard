import React, { useState } from "react";
import { View, ScrollView, TextInput } from "react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H4, Muted } from "@/components/ui/typography";
import { User, Mail, Phone, MapPin } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/supabase-provider";

interface EditProfileProps {
	// Define props if needed in the future
}

export default function EditProfile({}: EditProfileProps) {
	const insets = useSafeAreaInsets();
	const { session } = useAuth();

	const [formData, setFormData] = useState({
		name: session?.user?.user_metadata?.name || "",
		email: session?.user?.email || "",
		phone: session?.user?.user_metadata?.phone || "",
		location: session?.user?.user_metadata?.location || "",
	});

	const handleSave = () => {
		// TODO: Implement save functionality
		console.log("Saving profile:", formData);
	};

	const InputField = ({
		label,
		value,
		onChangeText,
		placeholder,
		icon,
		editable = true,
	}: {
		label: string;
		value: string;
		onChangeText: (text: string) => void;
		placeholder: string;
		icon: React.ReactNode;
		editable?: boolean;
	}) => (
		<View className="mb-4">
			<Text className="text-foreground font-medium mb-2">{label}</Text>
			<View className="flex-row items-center bg-muted/30 rounded-lg px-4 py-3 border border-border/50">
				<View className="mr-3 opacity-60">{icon}</View>
				<TextInput
					value={value}
					onChangeText={onChangeText}
					placeholder={placeholder}
					className="flex-1 text-foreground text-base"
					placeholderTextColor="#9CA3AF"
					editable={editable}
				/>
			</View>
		</View>
	);

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
					<Card className="shadow-sm mb-6">
						<CardHeader>
							<H4 className="text-foreground font-bold">
								Personal Information
							</H4>
							<Muted className="text-sm">Update your personal details</Muted>
						</CardHeader>

						<CardContent>
							<InputField
								label="Full Name"
								value={formData.name}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, name: text }))
								}
								placeholder="Enter your full name"
								icon={<User size={20} className="text-muted-foreground" />}
							/>

							<InputField
								label="Email Address"
								value={formData.email}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, email: text }))
								}
								placeholder="Enter your email"
								icon={<Mail size={20} className="text-muted-foreground" />}
								editable={false}
							/>

							<InputField
								label="Phone Number"
								value={formData.phone}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, phone: text }))
								}
								placeholder="Enter your phone number"
								icon={<Phone size={20} className="text-muted-foreground" />}
							/>

							<InputField
								label="Location"
								value={formData.location}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, location: text }))
								}
								placeholder="Enter your location"
								icon={<MapPin size={20} className="text-muted-foreground" />}
							/>
						</CardContent>
					</Card>

					<Button
						variant="default"
						size="lg"
						className="w-full py-4"
						onPress={handleSave}
					>
						<Text className="text-white font-semibold text-base">
							Save Changes
						</Text>
					</Button>
				</View>
			</ScrollView>
		</View>
	);
}
