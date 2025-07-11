import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BottomSheet, useBottomSheet } from "@/components/bottom-sheet";

interface EditProfileProps {
	// Define props if needed in the future
}

export default function EditProfile({}: EditProfileProps) {
	const { isVisible, open, close } = useBottomSheet();

	return (
		<View className="flex-1 p-4">
			<TouchableOpacity
				onPress={open}
				className="bg-green-500 px-6 py-3 rounded-lg"
			>
				<Text className="text-white font-semibold text-center">
					Edit Profile
				</Text>
			</TouchableOpacity>

			<BottomSheet
				isVisible={isVisible}
				onClose={close}
				// title="Edit Profile"
				snapPoints={[0.5, 0.8]}
			>
				<View className="gap-4">
					<View className="p-4 rounded-xl">
						<Text className="text-lg font-semibold text-green-600 dark:text-green-400">
							Profile Settings
						</Text>
						<Text className="mt-2 text-gray-700 dark:text-gray-300">
							Update your profile information and preferences to personalize
							your WasteGuard experience.
						</Text>
					</View>

					<TouchableOpacity
						onPress={close}
						className="bg-green-500 px-6 py-3 rounded-lg"
					>
						<Text className="text-white font-semibold text-center">
							Save Changes
						</Text>
					</TouchableOpacity>
				</View>
			</BottomSheet>
		</View>
	);
}
