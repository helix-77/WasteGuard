import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Control, Controller } from "react-hook-form";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { ProductFormData } from "../ProductForm";
import { BarcodeIcon } from "@/lib/icons/BarcodeIcon";

interface BarcodeFieldProps {
	control: Control<ProductFormData>;
	onOpenCamera: () => void;
	isLoading?: boolean;
}

export default function BarcodeField({
	control,
	onOpenCamera,
	isLoading = false,
}: BarcodeFieldProps) {
	return (
		<View className="mb-5">
			<Controller
				control={control}
				name="barcode"
				render={({ field: { onChange, onBlur, value } }) => (
					<>
						<View className="mb-2 flex-row items-center">
							<BarcodeIcon size={16} className="text-muted-foreground mr-2" />
							<Text className="text-muted-foreground">Barcode</Text>
						</View>
						<View className="flex-row items-center">
							<Input
								placeholder="Scan or enter barcode"
								value={value}
								onChangeText={onChange}
								onBlur={onBlur}
								className="flex-1 bg-muted rounded-xl placeholder:text-muted-foreground/50"
								editable={!isLoading}
							/>
							<TouchableOpacity
								onPress={onOpenCamera}
								disabled={isLoading}
								className="ml-3 bg-green-600 p-3 rounded-lg shadow-sm active:bg-green-700"
							>
								<BarcodeIcon size={20} color="#fff" />
							</TouchableOpacity>
						</View>
					</>
				)}
			/>
		</View>
	);
}
