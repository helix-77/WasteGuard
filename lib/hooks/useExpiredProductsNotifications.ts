import { useCallback, useState, useEffect } from "react";
import { Alert, AppState } from "react-native";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";
import { NotificationService } from "@/lib/services/notificationService";
import { ProductItem } from "@/lib/services/productService";

// The cooldown period between notifications (3 hours in milliseconds)
const NOTIFICATION_COOLDOWN = 3 * 60 * 60 * 1000;

// Days threshold for considering a product as "expiring soon"
const EXPIRING_SOON_THRESHOLD = 3;

/**
 * Custom hook for managing expired product notifications
 */
export const useExpiredProductsNotifications = (
	products: ProductItem[],
	deleteExpiredProducts: (fromNotification?: boolean) => Promise<void>,
) => {
	const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);
	const [appState, setAppState] = useState(AppState.currentState);
	const [pushToken, setPushToken] = useState<string | null>(null);

	const handleNotificationResponse = useCallback(
		(response: Notifications.NotificationResponse) => {
			// Extract data from the notification
			const { data } = response.notification.request.content;

			if (
				data?.type === "product_expiry" ||
				data?.type === "expired_products" ||
				data?.type === "background_check"
			) {
				// Navigate to products screen
				router.push("/products");

				// If the user selected "Clean Up" action, delete expired products
				if (response.actionIdentifier === "CLEAN_UP") {
					deleteExpiredProducts(true);
				}
			}
		},
		[deleteExpiredProducts],
	);

	const initializeNotifications = useCallback(async () => {
		try {
			// Request permissions
			const permissionsGranted = await NotificationService.requestPermissions();

			if (permissionsGranted) {
				// Register for push notifications if permissions granted
				const token =
					await NotificationService.registerForPushNotificationsAsync();
				if (token) {
					setPushToken(token);
				}

				// Set up notification listeners
				NotificationService.setupNotificationListeners(
					undefined, // No need to handle received notifications in the foreground
					handleNotificationResponse,
				);

				// Schedule recurring background check for expiring products
				await NotificationService.scheduleRecurringExpiryCheck(
					EXPIRING_SOON_THRESHOLD,
				);

				// Schedule a background task to run regularly to check products
				await NotificationService.scheduleBackgroundCheckTask(
					0, // Expired threshold (0 days or less)
					EXPIRING_SOON_THRESHOLD, // Expiring soon threshold (3 days)
				);
			}
		} catch (error) {
			console.error("Error initializing notifications:", error);
		}
	}, [handleNotificationResponse]);

	const checkProductExpirations = useCallback(() => {
		// Find expired products (0 or fewer days left)
		const expiredProducts = products.filter((product) => product.daysLeft <= 0);

		// Find products expiring soon (between 1 and EXPIRING_SOON_THRESHOLD days left)
		const expiringProducts = products.filter(
			(product) =>
				product.daysLeft > 0 && product.daysLeft <= EXPIRING_SOON_THRESHOLD,
		);

		const currentTime = Date.now();

		// Only show notification if there are products to notify about and enough time has passed
		const shouldShowNotification =
			(expiredProducts.length > 0 || expiringProducts.length > 0) &&
			currentTime - lastNotificationTime > NOTIFICATION_COOLDOWN;

		if (shouldShowNotification) {
			// Update last notification time
			setLastNotificationTime(currentTime);

			// Schedule notification for both expired and expiring products
			NotificationService.scheduleProductExpiryNotification(
				expiredProducts.length,
				expiringProducts.length,
				{ screen: "products" },
			);

			// Also show an alert with option to clean up if there are expired products
			if (expiredProducts.length > 0) {
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
		}

		// Return the counts for potential use elsewhere
		return {
			expiredCount: expiredProducts.length,
			expiringCount: expiringProducts.length,
		};
	}, [products, deleteExpiredProducts, lastNotificationTime]);

	// Initialize notifications when the app starts
	useEffect(() => {
		initializeNotifications();

		// Clean up when component unmounts
		return () => {
			NotificationService.removeNotificationListeners();
		};
	}, [initializeNotifications]);

	// Set up AppState change listener
	useEffect(() => {
		// Listen for app state changes (foreground, background, etc.)
		const subscription = AppState.addEventListener("change", (nextAppState) => {
			// Check for products when app comes to foreground from background
			if (appState !== "active" && nextAppState === "active") {
				checkProductExpirations();
			} else if (appState === "active" && nextAppState !== "active") {
				// App is going to background, schedule a background check
				const productCounts = checkProductExpirations();

				// Only register the background task if there are products to monitor
				if (productCounts.expiredCount > 0 || productCounts.expiringCount > 0) {
					// Schedule notification directly
					NotificationService.scheduleProductExpiryNotification(
						productCounts.expiredCount,
						productCounts.expiringCount,
						{ screen: "products" },
						true, // Schedule for future
					);
				}
			}
			setAppState(nextAppState);
		});

		// Clean up listener on unmount
		return () => {
			subscription.remove();
			NotificationService.removeNotificationListeners();
		};
	}, [appState, checkProductExpirations]);

	// Check for expired products when component mounts
	useEffect(() => {
		// Delay initial check to avoid showing immediately on app open
		const timeoutId = setTimeout(() => {
			checkProductExpirations();
		}, 5000); // Delay by 5 seconds

		return () => clearTimeout(timeoutId);
	}, [checkProductExpirations]);

	return {
		checkExpiredProducts: checkProductExpirations,
		pushToken,
	};
};

export default useExpiredProductsNotifications;
