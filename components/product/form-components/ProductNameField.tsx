import React from "react";
import { View } from "react-native";
import { Control, Controller, FieldError } from "react-hook-form";
import { Input } from "../../ui/input";
import { Text } from "../../ui/text";
import { Label } from "../../ui/label";
import { Package } from "lucide-react-native";
import { ProductFormData } from "../ProductForm";

interface ProductNameFieldProps {
	control: Control<ProductFormData>;
	error?: FieldError;
	isLoading?: boolean;
}

export default function ProductNameField({
	control,
	error,
	isLoading = false,
}: ProductNameFieldProps) {
	return (
		<View className="mb-5">
			<Controller
				control={control}
				name="name"
				rules={{
					required: "Product name is required",
					minLength: {
						value: 2,
						message: "Name must be at least 2 characters",
					},
				}}
				render={({ field: { onChange, onBlur, value } }) => (
					<>
						<View className="mb-2 flex-row items-center ">
							<Package size={16} className="text-muted-foreground mr-2" />
							<Text className="text-muted-foreground">Product Name *</Text>
						</View>
						<Input
							placeholder="Enter product name"
							value={value}
							onChangeText={onChange}
							onBlur={onBlur}
							className={`${error ? "border-red-500" : "bg-muted"} rounded-xl placeholder:text-muted-foreground/50`}
							editable={!isLoading}
							returnKeyType="next"
							autoCapitalize="words"
							autoCorrect={true}
							blurOnSubmit={false}
						/>
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
