import React from "react";
import { View } from "react-native";
import { Control, Controller } from "react-hook-form";
import { Text } from "../../ui/text";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { ProductFormData } from "../ProductForm";

interface NotesFieldProps {
	control: Control<ProductFormData>;
	isLoading?: boolean;
}

export default function NotesField({
	control,
	isLoading = false,
}: NotesFieldProps) {
	return (
		<View className="mb-8">
			<Controller
				control={control}
				name="notes"
				render={({ field: { onChange, onBlur, value } }) => (
					<>
						<Label className="mb-2 text-muted-foreground">
							Additional Notes
						</Label>
						<Textarea
							placeholder="Any additional details about the product..."
							value={value}
							onChangeText={onChange}
							onBlur={onBlur}
							className="rounded-2xl bg-muted min-h-20 placeholder:text-muted-foreground/50"
							editable={!isLoading}
							maxLength={500}
						/>
						<Text className="text-xs text-gray-500 mt-1 text-right">
							{value?.length || 0}/500
						</Text>
					</>
				)}
			/>
		</View>
	);
}
