import { View, ActivityIndicator, Alert } from "react-native";
import React from "react";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { LogOut } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";

interface SignOutButtonProps {
	onSignOut: () => void;
	loading?: boolean;
}

const SignOutButton: React.FC<SignOutButtonProps> = React.memo(
	({ onSignOut, loading = false }) => {
		const handleSignOutPress = React.useCallback(() => {
			Alert.alert(
				"Sign Out",
				"Are you sure you want to sign out of your account?",
				[
					{
						text: "Cancel",
						style: "cancel",
					},
					{
						text: "Sign Out",
						style: "destructive",
						onPress: onSignOut,
					},
				],
				{ cancelable: true },
			);
		}, [onSignOut]);

		return (
			<View className="px-4">
				<Button
					variant="ghost"
					onPress={handleSignOutPress}
					disabled={loading}
					size={"lg"}
					className="flex-row items-center justify-center "
				>
					{loading ? (
						<ActivityIndicator size="small" color="#ef4444" />
					) : (
						<>
							<Icon as={LogOut} size={18} className="text-red-500 mr-2" />
							<Text className="font-semibold text-red-500 text-base">
								Sign Out
							</Text>
						</>
					)}
				</Button>
			</View>
		);
	},
);

SignOutButton.displayName = "SignOutButton";

export default SignOutButton;
