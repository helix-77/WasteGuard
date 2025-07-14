import { View, ActivityIndicator } from "react-native";
import React from "react";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { LogOut } from "@/lib/icons/profileIcons";

interface SignOutButtonProps {
	onSignOut: () => void;
	loading?: boolean;
}

const SignOutButton: React.FC<SignOutButtonProps> = ({
	onSignOut,
	loading = false,
}) => {
	return (
		<View className="mx-4 mb-8">
			<Button
				variant={"link"}
				onPress={onSignOut}
				size="lg"
				disabled={loading}
				className="w-full flex-row items-center justify-center rounded-2xl py-4 shadow-md"
			>
				{loading ? (
					<ActivityIndicator size="small" color="white" />
				) : (
					<>
						<LogOut size={18} className="text-red-500 mr-2" />
						<Text className="font-semibold text-red-500 text-base">
							Sign Out
						</Text>
					</>
				)}
			</Button>
		</View>
	);
};

export default SignOutButton;
