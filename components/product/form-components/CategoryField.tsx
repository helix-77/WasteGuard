import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { Control, Controller, FieldError } from "react-hook-form";
import { Text } from "../../ui/text";
import { Tag, Plus } from "lucide-react-native";
import { ProductFormData } from "../ProductForm";
import {
	saveCustomCategory,
	getCustomCategories,
} from "../../../lib/utils/categoryStorage";

// Common categories for quick selection
const defaultCategories = [
	"🍟Snacks",
	"🥤Beverages",
	"💄Cosmetics",
	"🥛Dairy",
	"❄️Frozen",
	"🛒Groceries",
	"🧂Pantry",
];

interface CategoryFieldProps {
	control: Control<ProductFormData>;
	error?: FieldError;
	isLoading?: boolean;
}

export default function CategoryField({
	control,
	error,
	isLoading = false,
}: CategoryFieldProps) {
	const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
	const [categories, setCategories] = useState<string[]>(defaultCategories);

	// Load custom categories on component mount
	useEffect(() => {
		const loadCustomCategories = async () => {
			try {
				const customCategories = await getCustomCategories();
				// Combine default and custom categories, removing duplicates
				const allCategories = [...defaultCategories];

				customCategories.forEach((category) => {
					if (!allCategories.includes(category)) {
						allCategories.push(category);
					}
				});

				setCategories(allCategories);
			} catch (error) {
				console.error("Error loading custom categories:", error);
			}
		};

		loadCustomCategories();
	}, []);

	const handleCategorySelect = (
		category: string,
		onChange: (value: string) => void,
	) => {
		onChange(category);
		setShowCategoryDropdown(false);
	};

	const handleNewCategory = (onChange: (value: string) => void) => {
		Alert.prompt(
			"Add New Category",
			"Enter a new category name:",
			[
				{
					text: "Cancel",
					style: "cancel",
					onPress: () => setShowCategoryDropdown(false),
				},
				{
					text: "Add",
					onPress: (text) => {
						if (text && text.trim()) {
							const newCategory = text.trim();
							// Save the new category to AsyncStorage
							saveCustomCategory(newCategory)
								.then(() => {
									// Add the new category to the local state if it's not already there
									if (!categories.includes(newCategory)) {
										setCategories([...categories, newCategory]);
									}
									onChange(newCategory);
									setShowCategoryDropdown(false);
								})
								.catch((error) => {
									console.error("Error saving new category:", error);
									// Still set the category for the current form
									onChange(newCategory);
									setShowCategoryDropdown(false);
								});
						}
					},
				},
			],
			"plain-text",
		);
	};

	return (
		<View className="mb-5">
			<Controller
				control={control}
				name="category"
				rules={{ required: "Category is required" }}
				render={({ field: { onChange, onBlur, value } }) => (
					<>
						<View className="mb-2 flex-row items-center">
							<Tag size={16} className="text-muted-foreground mr-2" />
							<Text className="text-muted-foreground">Category *</Text>
						</View>
						<TouchableOpacity
							className={`rounded-xl p-3 flex-row bg-muted items-center justify-between ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"} ${showCategoryDropdown ? "border-green-500" : ""}`}
							onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
							disabled={isLoading}
						>
							<Text
								className={
									value ? "text-gray-900 dark:text-gray-100" : "text-gray-500"
								}
							>
								{value || "Select category"}
							</Text>
							<Tag size={16} className="text-gray-600 dark:text-gray-400" />
						</TouchableOpacity>

						{showCategoryDropdown && (
							<View className="mt-2 border rounded-xl border-gray-300 dark:border-gray-600 bg-muted shadow-lg">
								{categories.map((category: string) => (
									<TouchableOpacity
										key={category}
										className="p-3 border-gray-200 dark:border-gray-700"
										onPress={() => handleCategorySelect(category, onChange)}
									>
										<Text className="text-gray-900 dark:text-gray-100">
											{category}
										</Text>
									</TouchableOpacity>
								))}
								{/* Add new category option */}
								<TouchableOpacity
									className="p-3 flex-row items-center border-t border-gray-200 dark:border-gray-700"
									onPress={() => handleNewCategory(onChange)}
								>
									<Plus size={16} color="#16a34a" />
									<Text className="text-green-600 font-medium ml-1">
										Add new category
									</Text>
								</TouchableOpacity>
							</View>
						)}

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
