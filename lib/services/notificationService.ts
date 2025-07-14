import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Configure notification handler for global notifications that play sound
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowBanner: true,
		shouldShowList: true,
		shouldPlaySound: true, // Enable sound for notifications
		shouldSetBadge: true, // Enable badge for notifications
		priority: Notifications.AndroidNotificationPriority.MAX, // Use high priority for Android
	}),
});

/**
 * Notification service for managing application notifications
 */
export class NotificationService {
	static notificationListeners: { remove: () => void }[] = [];

	static async requestPermissions() {
		if (Platform.OS === "android") {
			await Notifications.setNotificationChannelAsync("default", {
				name: "WasteGuard Notifications",
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: "#22c55e",
				sound: "default", // Use default sound
			});

			// Create a specific channel for expiry notifications with sound
			await Notifications.setNotificationChannelAsync("expiry_notifications", {
				name: "Expiry Alerts",
				description:
					"Notifications for products about to expire or already expired",
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: "#ef4444", // Red color for urgency
				sound: "default", // Use default sound
			});
		}

		const { status } = await Notifications.requestPermissionsAsync();
		return status === "granted";
	}

	private static handleRegistrationError(errorMessage: string): null {
		console.error(errorMessage);
		return null;
	}

	static async registerForPushNotificationsAsync(): Promise<string | null> {
		if (Platform.OS === "android") {
			// Ensure Android notification channel is configured
			await Notifications.setNotificationChannelAsync("default", {
				name: "WasteGuard Default",
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: "#22c55e",
				sound: "default",
			});
		}

		// Check if running on a physical device
		if (!Device.isDevice) {
			return this.handleRegistrationError(
				"Must use physical device for Push Notifications",
			);
		}

		// Check and request permissions
		const { status: existingStatus } =
			await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;

		if (existingStatus !== "granted") {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}

		if (finalStatus !== "granted") {
			return this.handleRegistrationError(
				"Failed to get push token for push notification!",
			);
		}

		// Get push token
		try {
			// Try to get the project ID for EAS
			const projectId =
				Constants?.expoConfig?.extra?.eas?.projectId ??
				Constants?.easConfig?.projectId;

			if (!projectId) {
				console.log("Project ID not found for push notifications");
			}

			const tokenData = await Notifications.getExpoPushTokenAsync({
				projectId,
			});

			const token = tokenData.data;
			console.log("Push token:", token);
			return token;
		} catch (error) {
			console.log("Error getting push token:", error);
		}
	}

	static async scheduleNotification(
		title: string,
		body: string,
		data?: Record<string, unknown>,
		trigger: Notifications.NotificationTriggerInput = null,
		sound: boolean = true,
		channelId: string = "default",
	) {
		const notificationId = await Notifications.scheduleNotificationAsync({
			content: {
				title,
				body,
				data: data || {},
				sound: sound ? true : undefined,
				badge: 1, // Increment badge count
				...(Platform.OS === "android" ? { channelId } : {}),
			},
			trigger,
		});

		return notificationId;
	}

	static async scheduleProductExpiryNotification(
		expiredCount: number,
		expiringCount: number,
		data: Record<string, unknown> = {},
		scheduleFuture: boolean = false,
	) {
		let title = "";
		let body = "";

		// Create appropriate notification content based on expired and expiring counts
		if (expiredCount > 0 && expiringCount > 0) {
			title = "Product Expiration Alert";
			body = `You have ${expiredCount} expired product${
				expiredCount > 1 ? "s" : ""
			} and ${expiringCount} product${
				expiringCount > 1 ? "s" : ""
			} expiring soon. Check your inventory!`;
		} else if (expiredCount > 0) {
			title = "Expired Products Alert";
			body = `You have ${expiredCount} expired product${
				expiredCount > 1 ? "s" : ""
			} in your inventory. Clean them up to maintain freshness!`;
		} else if (expiringCount > 0) {
			title = "Products Expiring Soon";
			body = `You have ${expiringCount} product${
				expiringCount > 1 ? "s" : ""
			} expiring soon. Use them before they go bad!`;
		} else {
			return null; // No products to notify about
		}

		// Set up the trigger (null for immediate, or scheduled for future)
		let trigger: Notifications.NotificationTriggerInput = null;
		if (scheduleFuture) {
			trigger = {
				type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
				seconds: 60 * 60 * 24, // Daily check
				repeats: true,
			} as Notifications.TimeIntervalTriggerInput;
		}

		// Add action buttons for Android (iOS needs to be configured in app.json)
		const categoryId = "EXPIRY_ACTIONS";

		// Set up notification categories for actions
		if (Platform.OS === "ios") {
			await Notifications.setNotificationCategoryAsync(categoryId, [
				{
					identifier: "VIEW",
					buttonTitle: "View Products",
					options: {
						isDestructive: false,
						isAuthenticationRequired: false,
					},
				},
				{
					identifier: "CLEAN_UP",
					buttonTitle: "Clean Up",
					options: {
						isDestructive: true,
						isAuthenticationRequired: false,
					},
				},
			]);
		}

		return this.scheduleNotification(
			title,
			body,
			{
				...data,
				type: "product_expiry",
				categoryId,
				expiredCount,
				expiringCount,
			},
			trigger,
			true, // Enable sound
			"expiry_notifications", // Use the expiry channel for Android
		);
	}

	/**
	 * Schedule the old-style notification for expired products (kept for backward compatibility)
	 */
	static async scheduleExpiredProductsNotification(
		expiredCount: number,
		data: Record<string, unknown> = {},
	) {
		return this.scheduleNotification(
			"Expired Products Alert",
			`You have ${expiredCount} expired product${
				expiredCount > 1 ? "s" : ""
			} in your inventory. Clean them up to maintain freshness!`,
			{ ...data, type: "expired_products" },
			null,
			true,
			"expiry_notifications",
		);
	}

	static async cancelNotification(notificationId: string) {
		await Notifications.cancelScheduledNotificationAsync(notificationId);
	}

	static async cancelAllNotifications() {
		await Notifications.cancelAllScheduledNotificationsAsync();
	}

	static async getPendingNotifications() {
		return await Notifications.getAllScheduledNotificationsAsync();
	}

	static setupNotificationListeners(
		onNotificationReceived?: (notification: Notifications.Notification) => void,
		onNotificationResponseReceived?: (
			response: Notifications.NotificationResponse,
		) => void,
	) {
		// Clean up any existing listeners
		this.removeNotificationListeners();

		// Set up new listeners
		if (onNotificationReceived) {
			const receivedListener = Notifications.addNotificationReceivedListener(
				onNotificationReceived,
			);
			this.notificationListeners.push(receivedListener);
		}

		if (onNotificationResponseReceived) {
			const responseListener =
				Notifications.addNotificationResponseReceivedListener(
					onNotificationResponseReceived,
				);
			this.notificationListeners.push(responseListener);
		}
	}

	static removeNotificationListeners() {
		this.notificationListeners.forEach((listener) => {
			if (listener && typeof listener.remove === "function") {
				listener.remove();
			}
		});
		this.notificationListeners = [];
	}

	static async scheduleRecurringExpiryCheck(days: number = 3) {
		// Cancel any existing scheduled expiry checks
		const pendingNotifications = await this.getPendingNotifications();
		for (const notification of pendingNotifications) {
			if (notification.content.data?.type === "recurring_expiry_check") {
				await this.cancelNotification(notification.identifier);
			}
		}

		// Schedule a new daily check
		await Notifications.scheduleNotificationAsync({
			content: {
				title: "WasteGuard Background Check",
				body: "Checking for expiring and expired products...",
				data: { type: "recurring_expiry_check", expiryThreshold: days },
				sound: false,
				...(Platform.OS === "android" ? { channelId: "default" } : {}),
			},
			trigger: {
				type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
				seconds: 60 * 60 * 24, // Daily check
				repeats: true,
			} as Notifications.TimeIntervalTriggerInput,
		});
	}

	static async scheduleBackgroundCheckTask(
		expiredThreshold: number = 0,
		expiringThreshold: number = 3,
	) {
		// Schedule the task to run every 6 hours to check product expirations
		await Notifications.scheduleNotificationAsync({
			content: {
				title: "WasteGuard",
				body: "Checking your products...",
				data: {
					type: "background_check",
					expiredThreshold,
					expiringThreshold,
				},
				sound: false, // No sound for the background task itself
				...(Platform.OS === "android" ? { channelId: "default" } : {}),
			},
			trigger: {
				type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
				seconds: 6 * 60 * 60, // Every 6 hours
				repeats: true,
			} as Notifications.TimeIntervalTriggerInput,
		});
	}

	static async sendPushNotification(
		expoPushToken: string,
		title: string,
		body: string,
		data: Record<string, unknown> = {},
		sound: boolean = true,
	) {
		const message = {
			to: expoPushToken,
			sound: sound ? "default" : null,
			title: title,
			body: body,
			data: data,
			priority: "high",
		};

		try {
			const response = await fetch("https://exp.host/--/api/v2/push/send", {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Accept-encoding": "gzip, deflate",
					"Content-Type": "application/json",
				},
				body: JSON.stringify(message),
			});

			const responseData = await response.json();
			return responseData;
		} catch (error) {
			console.error("Error sending push notification:", error);
			throw error;
		}
	}

	static async sendExpiryPushNotification(
		expoPushToken: string,
		expiredCount: number,
		expiringCount: number,
		data: Record<string, unknown> = {},
	) {
		// Create appropriate notification content based on expired and expiring counts
		let title = "";
		let body = "";

		if (expiredCount > 0 && expiringCount > 0) {
			title = "Product Expiration Alert";
			body = `You have ${expiredCount} expired product${
				expiredCount > 1 ? "s" : ""
			} and ${expiringCount} product${
				expiringCount > 1 ? "s" : ""
			} expiring soon. Check your inventory!`;
		} else if (expiredCount > 0) {
			title = "Expired Products Alert";
			body = `You have ${expiredCount} expired product${
				expiredCount > 1 ? "s" : ""
			} in your inventory. Clean them up to maintain freshness!`;
		} else if (expiringCount > 0) {
			title = "Products Expiring Soon";
			body = `You have ${expiringCount} product${
				expiringCount > 1 ? "s" : ""
			} expiring soon. Use them before they go bad!`;
		} else {
			return null; // No products to notify about
		}

		return this.sendPushNotification(
			expoPushToken,
			title,
			body,
			{ ...data, type: "product_expiry" },
			true,
		);
	}
}

export default NotificationService;
