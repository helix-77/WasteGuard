import AsyncStorage from "@react-native-async-storage/async-storage";

const CUSTOM_CATEGORIES_KEY = "WasteGuard_CustomCategories";

/**
 * Get all custom categories from AsyncStorage
 * @returns Promise<string[]> Array of custom categories
 */
export const getCustomCategories = async (): Promise<string[]> => {
	try {
		const categoriesJson = await AsyncStorage.getItem(CUSTOM_CATEGORIES_KEY);
		if (categoriesJson) {
			return JSON.parse(categoriesJson);
		}
		return [];
	} catch (error) {
		console.error("Error retrieving custom categories:", error);
		return [];
	}
};

/**
 * Save a new custom category to AsyncStorage
 * @param category New category to save
 */
export const saveCustomCategory = async (category: string): Promise<void> => {
	try {
		// Get existing categories
		const existingCategories = await getCustomCategories();

		// Check if category already exists
		if (!existingCategories.includes(category)) {
			// Add new category and save back to AsyncStorage
			const updatedCategories = [...existingCategories, category];
			await AsyncStorage.setItem(
				CUSTOM_CATEGORIES_KEY,
				JSON.stringify(updatedCategories),
			);
		}
	} catch (error) {
		console.error("Error saving custom category:", error);
	}
};

/**
 * Remove a custom category from AsyncStorage
 * @param category Category to remove
 */
export const removeCustomCategory = async (category: string): Promise<void> => {
	try {
		const existingCategories = await getCustomCategories();
		const updatedCategories = existingCategories.filter((c) => c !== category);
		await AsyncStorage.setItem(
			CUSTOM_CATEGORIES_KEY,
			JSON.stringify(updatedCategories),
		);
	} catch (error) {
		console.error("Error removing custom category:", error);
	}
};
