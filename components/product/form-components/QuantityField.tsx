import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Control, Controller, FieldError } from "react-hook-form";
import { Input } from "../../ui/input";
import { Text } from "../../ui/text";
import { ProductFormData } from "../ProductForm";
import { Hash } from "@/lib/icons/Hash";

interface QuantityFieldProps {
	control: Control<ProductFormData>;
	error?: FieldError;
	isLoading?: boolean;
}

export default function QuantityField({
	control,
	error,
	isLoading = false,
}: QuantityFieldProps) {
	return (
		<View className="mb-5">
			<Controller
				control={control}
				name="quantity"
				rules={{
					min: { value: 1, message: "Quantity must be at least 1" },
					max: { value: 999, message: "Quantity cannot exceed 999" },
				}}
				render={({ field: { onChange, onBlur, value } }) => (
					<>
						<View className="mb-2 flex-row items-center">
							<Hash size={16} className="text-muted-foreground mr-1" />
							<Text className="text-muted-foreground"> Quantity </Text>
						</View>
						<View className="flex-row items-center">
							<TouchableOpacity
								className="bg-gray-200 dark:bg-gray-700 p-3 rounded-l-lg"
								onPress={() => onChange(Math.max(1, value - 1))}
								disabled={isLoading || value <= 1}
							>
								<Text className="text-lg font-bold text-gray-700 dark:text-gray-300">
									-
								</Text>
							</TouchableOpacity>
							<Input
								keyboardType="numeric"
								value={value.toString()}
								onChangeText={(val) => {
									const num = parseInt(val) || 1;
									onChange(Math.min(999, Math.max(1, num)));
								}}
								onBlur={onBlur}
								className="flex-1 text-center bg-muted rounded-none"
								editable={!isLoading}
							/>
							<TouchableOpacity
								className="bg-gray-200 dark:bg-gray-700 p-3 rounded-r-lg"
								onPress={() => onChange(Math.min(999, value + 1))}
								disabled={isLoading || value >= 999}
							>
								<Text className="text-lg font-bold text-gray-700 dark:text-gray-300">
									+
								</Text>
							</TouchableOpacity>
						</View>
						{error && (
							<Text className="text-red-500 text-xs mt-1 ml-1">
								{error.message}
							</Text>
						)}
					</>
				)}
			/>
		</View>
	);
}
