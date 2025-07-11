import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification handler
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowBanner: true,
		shouldShowList: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
	}),
});

/**
 * Notification service for managing application notifications
 */
export class NotificationService {
	static async requestPermissions() {
		if (Platform.OS === "android") {
			await Notifications.setNotificationChannelAsync("default", {
				name: "default",
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: "#22c55e",
			});
		}

		const { status } = await Notifications.requestPermissionsAsync();
		return status === "granted";
	}

	static async scheduleNotification(
		title: string,
		body: string,
		data?: Record<string, unknown>,
		trigger: Notifications.NotificationTriggerInput = null,
	) {
		const notificationId = await Notifications.scheduleNotificationAsync({
			content: {
				title,
				body,
				data: data || {},
			},
			trigger,
		});

		return notificationId;
	}

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
		);
	}

	/**
	 * Cancel a specific notification
	 * @param notificationId - The ID of the notification to cancel
	 */
	static async cancelNotification(notificationId: string) {
		await Notifications.cancelScheduledNotificationAsync(notificationId);
	}

	static async cancelAllNotifications() {
		await Notifications.cancelAllScheduledNotificationsAsync();
	}

	static async getPendingNotifications() {
		return await Notifications.getAllScheduledNotificationsAsync();
	}
}

export default NotificationService;
