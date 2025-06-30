import React from "react";
import { View } from "react-native";
import { Button } from "../../ui/button";
import { Text } from "../../ui/text";

interface SubmitButtonProps {
	onSubmit: () => void;
	isLoading: boolean;
	isValid: boolean;
}

export default function SubmitButton({
	onSubmit,
	isLoading,
	isValid,
}: SubmitButtonProps) {
	return (
		<Button
			className={`mb-4 py-4 rounded-xl ${isLoading ? "bg-gray-400" : "bg-green-600 active:bg-green-700 shadow-lg"}`}
			onPress={onSubmit}
			disabled={isLoading || !isValid}
		>
			<View className="flex-row items-center justify-center">
				{isLoading && (
					<View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
				)}
				<Text className="text-white font-semibold text-lg">
					{isLoading ? "Saving..." : "Save Product"}
				</Text>
			</View>
		</Button>
	);
}
