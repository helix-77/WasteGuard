import React from "react";
import { View } from "react-native";
import { Text } from "../../ui/text";

interface ValidationStatusProps {
	isValid: boolean;
	isDirty: boolean;
}

export default function ValidationStatus({
	isValid,
	isDirty,
}: ValidationStatusProps) {
	if (isValid || !isDirty) {
		return null;
	}

	return (
		<View className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
			<Text className="text-orange-800 dark:text-orange-200 text-sm text-center">
				Please fill in all required fields to continue
			</Text>
		</View>
	);
}
