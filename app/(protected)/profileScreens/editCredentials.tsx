import React, { useState } from "react";
import { View, ScrollView, TextInput, Alert } from "react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { Lock, Eye, EyeOff } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";

const EditCredentials = () => {
	const insets = useSafeAreaInsets();

	const [formData, setFormData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const [showPasswords, setShowPasswords] = useState({
		current: false,
		new: false,
		confirm: false,
	});

	const handleSave = () => {
		if (formData.newPassword !== formData.confirmPassword) {
			Alert.alert("Error", "New passwords do not match");
			return;
		}

		if (formData.newPassword.length < 6) {
			Alert.alert("Error", "Password must be at least 6 characters long");
			return;
		}

		// TODO: Implement password change functionality
		console.log("Changing password");
		Alert.alert("Success", "Password updated successfully");
	};

	const PasswordField = ({
		label,
		value,
		onChangeText,
		placeholder,
		showPassword,
		onToggleShow,
	}: {
		label: string;
		value: string;
		onChangeText: (text: string) => void;
		placeholder: string;
		showPassword: boolean;
		onToggleShow: () => void;
	}) => (
		<View className="mb-4">
			<Text className="text-foreground font-medium mb-2">{label}</Text>
			<View className="flex-row items-center bg-muted/30 rounded-lg px-4 py-3 border border-border/50">
				<Lock size={20} className="text-muted-foreground mr-3" />
				<TextInput
					value={value}
					onChangeText={onChangeText}
					placeholder={placeholder}
					className="flex-1 text-foreground text-base"
					placeholderTextColor="#9CA3AF"
					secureTextEntry={!showPassword}
				/>
				<TouchableOpacity onPress={onToggleShow} className="ml-2">
					{showPassword ? (
						<EyeOff size={20} className="text-muted-foreground" />
					) : (
						<Eye size={20} className="text-muted-foreground" />
					)}
				</TouchableOpacity>
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
							<Text variant="h4" className="text-foreground font-bold">
								Change Password
							</Text>
							<Text variant="muted" className="text-sm">
								Update your account password
							</Text>
						</CardHeader>

						<CardContent>
							<PasswordField
								label="Current Password"
								value={formData.currentPassword}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, currentPassword: text }))
								}
								placeholder="Enter your current password"
								showPassword={showPasswords.current}
								onToggleShow={() =>
									setShowPasswords((prev) => ({
										...prev,
										current: !prev.current,
									}))
								}
							/>

							<PasswordField
								label="New Password"
								value={formData.newPassword}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, newPassword: text }))
								}
								placeholder="Enter your new password"
								showPassword={showPasswords.new}
								onToggleShow={() =>
									setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
								}
							/>

							<PasswordField
								label="Confirm New Password"
								value={formData.confirmPassword}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, confirmPassword: text }))
								}
								placeholder="Confirm your new password"
								showPassword={showPasswords.confirm}
								onToggleShow={() =>
									setShowPasswords((prev) => ({
										...prev,
										confirm: !prev.confirm,
									}))
								}
							/>
						</CardContent>
					</Card>

					{/* Security Tips */}
					<Card className="shadow-sm mb-6">
						<CardHeader>
							<Text variant="h4" className="text-foreground font-bold">
								Security Tips
							</Text>
						</CardHeader>

						<CardContent>
							<View className="space-y-2">
								<Text className="text-foreground text-sm">
									• Use at least 8 characters
								</Text>
								<Text className="text-foreground text-sm">
									• Include uppercase and lowercase letters
								</Text>
								<Text className="text-foreground text-sm">
									• Add numbers and special characters
								</Text>
								<Text className="text-foreground text-sm">
									• Avoid common words or personal information
								</Text>
							</View>
						</CardContent>
					</Card>

					<Button
						variant="default"
						size="lg"
						className="w-full py-4"
						onPress={handleSave}
						disabled={
							!formData.currentPassword ||
							!formData.newPassword ||
							!formData.confirmPassword
						}
					>
						<Text className="text-white font-semibold text-base">
							Update Password
						</Text>
					</Button>
				</View>
			</ScrollView>
		</View>
	);
};

export default EditCredentials;
