import React, { useState, useCallback, useMemo, useEffect } from "react";
import { View, ScrollView, Alert, Keyboard } from "react-native";
import { useForm } from "react-hook-form";

import {
	ProductNameField,
	CategoryField,
	ExpiryDateField,
	QuantityField,
	NotesField,
	SubmitButton,
	ValidationStatus,
} from "./form-components";

interface ProductFormProps {
	initialImageUri?: string;
	onSave: (data: ProductFormData) => void;
	onOpenCamera: () => void;
	isLoading?: boolean;
}

export interface ProductFormData {
	name: string;
	category: string;
	expiryDate: Date;
	quantity: number;
	notes?: string;
	imageUri?: string;
}

export default function ProductForm({
	initialImageUri,
	onSave,
	onOpenCamera,
	isLoading = false,
}: ProductFormProps) {
	const [keyboardHeight, setKeyboardHeight] = useState(0);

	// Keyboard handling for better UX
	useEffect(() => {
		const keyboardDidShowListener = Keyboard.addListener(
			"keyboardDidShow",
			(e) => {
				setKeyboardHeight(e.endCoordinates.height);
			},
		);
		const keyboardDidHideListener = Keyboard.addListener(
			"keyboardDidHide",
			() => {
				setKeyboardHeight(0);
			},
		);

		return () => {
			keyboardDidShowListener?.remove();
			keyboardDidHideListener?.remove();
		};
	}, []);

	const defaultExpiryDate = useMemo(() => {
		const date = new Date();
		date.setDate(date.getDate() + 7); // Default 7 days from now
		return date;
	}, []);

	const {
		control,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isValid, isDirty },
	} = useForm<ProductFormData>({
		mode: "onChange", // Real-time validation
		defaultValues: {
			name: "",
			category: "",
			expiryDate: defaultExpiryDate,
			quantity: 1,
			notes: "",
			imageUri: initialImageUri,
		},
	});

	// Watch form values for dynamic updates
	const watchedExpiryDate = watch("expiryDate");

	useEffect(() => {
		if (initialImageUri) {
			setValue("imageUri", initialImageUri);
		}
	}, [initialImageUri, setValue]);

	// Handle date picker changes
	const onChangeDate = useCallback(
		(event: any, selectedDate?: Date) => {
			if (selectedDate) {
				setValue("expiryDate", selectedDate, { shouldValidate: true });
			}
		},
		[setValue],
	);

	// Handle form submission
	const onSubmit = useCallback(
		(data: ProductFormData) => {
			// Dismiss keyboard before submission
			Keyboard.dismiss();

			// Additional validation
			if (!data.name.trim()) {
				Alert.alert("Required Field", "Please enter a product name");
				return;
			}

			if (!data.category.trim()) {
				Alert.alert("Required Field", "Please select a category");
				return;
			}

			if (data.quantity < 1) {
				Alert.alert("Invalid Quantity", "Quantity must be at least 1");
				return;
			}

			// Check if expiry date is in the past
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			if (data.expiryDate < today) {
				Alert.alert(
					"Expiry Date Warning",
					"The expiry date is in the past. Are you sure you want to continue?",
					[
						{ text: "Cancel", style: "cancel" },
						{ text: "Continue", onPress: () => onSave(data) },
					],
				);
				return;
			}

			onSave(data);
		},
		[onSave],
	);

	return (
		<ScrollView
			className="flex-1"
			showsVerticalScrollIndicator={false}
			keyboardShouldPersistTaps="handled"
			contentContainerStyle={{
				paddingBottom: keyboardHeight > 0 ? keyboardHeight + 20 : 20,
			}}
		>
			<View className="px-1">
				{/* Product Name Field */}
				<ProductNameField
					control={control}
					error={errors.name}
					isLoading={isLoading}
				/>

				{/* Category Field */}
				<CategoryField
					control={control}
					error={errors.category}
					isLoading={isLoading}
				/>

				{/* Expiry Date Field */}
				<ExpiryDateField
					control={control}
					watchedExpiryDate={watchedExpiryDate}
					onChangeDate={onChangeDate}
					isLoading={isLoading}
				/>

				{/* Quantity Field */}
				<QuantityField
					control={control}
					error={errors.quantity}
					isLoading={isLoading}
				/>

				{/* Notes Field */}
				<NotesField control={control} isLoading={isLoading} />

				{/* Submit Button */}
				<SubmitButton
					onSubmit={handleSubmit(onSubmit)}
					isLoading={isLoading}
					isValid={isValid}
				/>

				{/* Validation Status */}
				<ValidationStatus isValid={isValid} isDirty={isDirty} />
			</View>
		</ScrollView>
	);
}
