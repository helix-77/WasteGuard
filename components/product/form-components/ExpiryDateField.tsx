import React, { useState, useMemo } from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import { Control, Controller } from "react-hook-form";
import { Text } from "../../ui/text";
import { ProductFormData } from "../ProductForm";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CalendarDays } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";

interface ExpiryDateFieldProps {
	control: Control<ProductFormData>;
	watchedExpiryDate: Date;
	onChangeDate: (event: any, selectedDate?: Date) => void;
	isLoading?: boolean;
}

export default function ExpiryDateField({
	control,
	watchedExpiryDate,
	onChangeDate,
	isLoading = false,
}: ExpiryDateFieldProps) {
	const [showDatePicker, setShowDatePicker] = useState(false);

	// Calculate days until expiry
	const daysUntilExpiry = useMemo(() => {
		const today = new Date();
		const expiry = new Date(watchedExpiryDate);
		const diffTime = expiry.getTime() - today.getTime();
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	}, [watchedExpiryDate]);

	// Expiry status color
	const expiryStatusColor = useMemo(() => {
		if (daysUntilExpiry < 0) return "text-red-600";
		if (daysUntilExpiry <= 3) return "text-orange-600";
		if (daysUntilExpiry <= 7) return "text-yellow-600";
		return "text-green-600";
	}, [daysUntilExpiry]);

	return (
		<View className="mb-5">
			<View className="mb-2 flex-row items-center">
				<CalendarDays size={16} className="text-muted-foreground mr-1" />
				<Text className="text-muted-foreground"> Expiry Date * </Text>
			</View>
			<Controller
				control={control}
				name="expiryDate"
				render={({ field: { value } }) => (
					<>
						<TouchableOpacity
							className="flex-row items-center  rounded-lg p-3 bg-muted"
							onPress={() => setShowDatePicker(true)}
							disabled={isLoading}
						>
							<CalendarDays size={20} className="text-gray-500 mr-3" />
							<View className="flex-1">
								<Text className="text-gray-900 dark:text-gray-100 font-medium">
									{value.toLocaleDateString()}
								</Text>
								<Text className={`text-sm ${expiryStatusColor}`}>
									{daysUntilExpiry < 0
										? `Expired ${Math.abs(daysUntilExpiry)} days ago`
										: daysUntilExpiry === 0
											? "Expires today"
											: `${daysUntilExpiry} days remaining`}
								</Text>
							</View>
						</TouchableOpacity>
					</>
				)}
			/>

			{showDatePicker && (
				<DateTimePicker
					value={watchedExpiryDate}
					mode="date"
					display={Platform.OS === "ios" ? "spinner" : "default"}
					onChange={(event, selectedDate) => {
						setShowDatePicker(false);
						onChangeDate(event, selectedDate);
					}}
					minimumDate={new Date()}
				/>
			)}
		</View>
	);
}
