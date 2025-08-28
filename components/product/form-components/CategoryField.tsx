import React, { useState, useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "../../ui/text";
import { Tag, Plus } from "lucide-react-native";
import {
	saveCustomCategory,
	getCustomCategories,
} from "../../../lib/utils/categoryStorage";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogClose,
	DialogTrigger,
} from "../../ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
	value?: string;
	onValueChange: (value: string) => void;
	error?: string;
	isLoading?: boolean;
}

export default function CategoryField({
	value,
	onValueChange,
	error,
	isLoading = false,
}: CategoryFieldProps) {
	const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
	const [categories, setCategories] = useState<string[]>(defaultCategories);
	const [newCategoryName, setNewCategoryName] = useState("");

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

	const handleCategorySelect = (category: string) => {
		onValueChange(category);
		setShowCategoryDropdown(false);
	};

	const handleNewCategory = () => {
		setNewCategoryName("");
	};

	const handleAddCategory = async () => {
		if (newCategoryName.trim()) {
			const newCategory = newCategoryName.trim();
			try {
				await saveCustomCategory(newCategory);
				if (!categories.includes(newCategory)) {
					setCategories([...categories, newCategory]);
				}
				onValueChange(newCategory);
				setShowCategoryDropdown(false);
				setNewCategoryName("");
			} catch (error) {
				console.error("Error saving new category:", error);
				// Still add the category locally and select it even if saving fails
				if (!categories.includes(newCategory)) {
					setCategories([...categories, newCategory]);
				}
				onValueChange(newCategory);
				setShowCategoryDropdown(false);
				setNewCategoryName("");
			}
		}
	};

	return (
		<View className="mb-5">
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
							onPress={() => handleCategorySelect(category)}
						>
							<Text className="text-gray-900 dark:text-gray-100">
								{category}
							</Text>
						</TouchableOpacity>
					))}

					{/* Add new category option */}
					<Dialog>
						<DialogTrigger asChild>
							<TouchableOpacity
								onPress={handleNewCategory}
								className="p-3 flex-row items-center border-t border-gray-200 dark:border-gray-700 justify-start"
							>
								<Plus size={16} color="#16a34a" />
								<Text className="text-green-600 font-medium ml-1">
									Add new category
								</Text>
							</TouchableOpacity>
						</DialogTrigger>

						<DialogContent className="mx-auto my-auto w-80 max-w-sm">
							<DialogHeader>
								<DialogTitle>Add New Category</DialogTitle>
							</DialogHeader>

							<Input
								placeholder="Enter category name"
								value={newCategoryName}
								onChangeText={setNewCategoryName}
							/>

							<DialogFooter>
								<View className="flex-row gap-3 w-full">
									<DialogClose asChild>
										<Button variant="outline" className="flex-1 min-w-24">
											<Text className="text-center text-gray-700 dark:text-gray-300 font-medium">
												Cancel
											</Text>
										</Button>
									</DialogClose>

									<DialogClose asChild>
										<Button
											className="flex-1 min-w-24"
											onPress={handleAddCategory}
										>
											<Text className="text-center text-white font-medium">
												Add
											</Text>
										</Button>
									</DialogClose>
								</View>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</View>
			)}

			{error && <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>}
		</View>
	);
}
