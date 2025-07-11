import { useCallback, useState, useEffect } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { NotificationService } from "@/lib/services/notificationService";
import { ProductItem } from "@/lib/services/productService";

// The cooldown period between notifications (3 hours in milliseconds)
const NOTIFICATION_COOLDOWN = 3 * 60 * 60 * 1000;

/**
 * Custom hook for managing expired product notifications
 */
export const useExpiredProductsNotifications = (
	products: ProductItem[],
	deleteExpiredProducts: (fromNotification?: boolean) => Promise<void>,
) => {
	const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);

	/**
	 * Checks for expired products and shows a notification if any are found
	 * Includes throttling to prevent notification spam
	 */
	const checkExpiredProducts = useCallback(() => {
		const expiredProducts = products.filter((product) => product.daysLeft <= 0);
		const currentTime = Date.now();

		// Only show notification if there are expired products and enough time has passed
		const shouldShowNotification =
			expiredProducts.length > 0 &&
			currentTime - lastNotificationTime > NOTIFICATION_COOLDOWN;

		if (shouldShowNotification) {
			// Update last notification time
			setLastNotificationTime(currentTime);

			// Show in-app notification
			NotificationService.scheduleExpiredProductsNotification(
				expiredProducts.length,
				{ screen: "products" },
			);

			// Also show an alert with option to clean up
			Alert.alert(
				"Expired Products Detected",
				`You have ${expiredProducts.length} expired product${
					expiredProducts.length > 1 ? "s" : ""
				} in your inventory. Clean them up now.`,
				[
					{
						text: "Show",
						style: "cancel",
					},
					{
						text: "Clean Up",
						style: "destructive",
						onPress: () => deleteExpiredProducts(true),
					},
				],
			);
		}
	}, [products, deleteExpiredProducts, lastNotificationTime]);

	// Initialize notifications when the app starts
	useEffect(() => {
		const initializeNotifications = async () => {
			// Request permissions on component mount
			await NotificationService.requestPermissions();
		};

		initializeNotifications();
	}, []);

	// Check for expired products when component mounts
	useEffect(() => {
		// Delay initial check to avoid showing immediately on app open
		const timeoutId = setTimeout(() => {
			checkExpiredProducts();
		}, 5000); // Delay by 5 seconds

		return () => clearTimeout(timeoutId);
	}, [checkExpiredProducts]);

	// Function to handle app state changes (simulated)
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			checkExpiredProducts();
		}, 30000); // Only check again after 30 seconds of app being active

		return () => clearTimeout(timeoutId);
	}, [checkExpiredProducts]);

	return {
		checkExpiredProducts,
	};
};

export default useExpiredProductsNotifications;
