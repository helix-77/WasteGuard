import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import * as Notifications from "expo-notifications";
import { NotificationService } from "@/lib/services/notificationService";

interface NotificationDebuggerProps {
	onClose?: () => void;
}

/**
 * A component for debugging notifications during development
 */
export default function NotificationDebugger({
	onClose,
}: NotificationDebuggerProps) {
	const [expoPushToken, setExpoPushToken] = useState<string>("");
	const [notification, setNotification] =
		useState<Notifications.Notification | null>(null);
	const [pendingNotifications, setPendingNotifications] = useState<
		Notifications.NotificationRequest[]
	>([]);

	useEffect(() => {
		// Get the push token
		NotificationService.registerForPushNotificationsAsync()
			.then((token) => {
				if (token) {
					setExpoPushToken(token);
				}
			})
			.catch((error) => console.log("Error getting push token:", error));

		// Set up notification listeners
		const notificationListener = Notifications.addNotificationReceivedListener(
			(notification) => {
				setNotification(notification);
			},
		);

		// Load pending notifications
		loadPendingNotifications();

		// Clean up
		return () => {
			notificationListener.remove();
		};
	}, []);

	const loadPendingNotifications = async () => {
		try {
			const notifications = await NotificationService.getPendingNotifications();
			setPendingNotifications(notifications);
		} catch (error) {
			console.log("Error loading pending notifications:", error);
		}
	};

	const sendTestNotification = async () => {
		if (!expoPushToken) {
			alert(
				"No push token available. Make sure you're using a physical device.",
			);
			return;
		}

		try {
			await NotificationService.sendPushNotification(
				expoPushToken,
				"Test Notification",
				"This is a test notification from WasteGuard",
				{ test: true },
			);
			alert("Test notification sent!");
		} catch (error) {
			console.log("Error sending test notification:", error);
			alert(`Failed to send notification: ${error}`);
		}
	};

	const scheduleTestNotification = async () => {
		try {
			const id = await NotificationService.scheduleNotification(
				"Scheduled Test",
				"This notification was scheduled for 5 seconds from now",
				{ test: true },
				{
					type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
					seconds: 5,
					repeats: false,
				} as Notifications.TimeIntervalTriggerInput,
			);
			alert(`Scheduled notification with ID: ${id}`);
			setTimeout(loadPendingNotifications, 1000);
		} catch (error) {
			console.log("Error scheduling notification:", error);
			alert(`Failed to schedule notification: ${error}`);
		}
	};

	const scheduleExpiryNotification = async () => {
		try {
			const id = await NotificationService.scheduleProductExpiryNotification(
				2, // expired count
				3, // expiring count
				{ test: true },
			);
			alert(`Scheduled expiry notification with ID: ${id}`);
			setTimeout(loadPendingNotifications, 1000);
		} catch (error) {
			console.log("Error scheduling expiry notification:", error);
			alert(`Failed to schedule expiry notification: ${error}`);
		}
	};

	const cancelAllNotifications = async () => {
		try {
			await NotificationService.cancelAllNotifications();
			alert("All scheduled notifications canceled");
			setPendingNotifications([]);
		} catch (error) {
			console.log("Error canceling notifications:", error);
			alert(`Failed to cancel notifications: ${error}`);
		}
	};

	return (
		<View style={styles.container}>
			<ScrollView style={styles.scrollView}>
				<Text style={styles.title}>Notification Debugger</Text>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Push Token</Text>
					<Text style={styles.tokenText}>
						{expoPushToken || "No token available"}
					</Text>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Last Received Notification</Text>
					{notification ? (
						<View>
							<Text style={styles.label}>
								Title: {notification.request.content.title}
							</Text>
							<Text style={styles.label}>
								Body: {notification.request.content.body}
							</Text>
							<Text style={styles.label}>
								Data:{" "}
								{JSON.stringify(notification.request.content.data, null, 2)}
							</Text>
						</View>
					) : (
						<Text style={styles.infoText}>No notification received yet</Text>
					)}
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>
						Pending Notifications ({pendingNotifications.length})
					</Text>
					{pendingNotifications.length > 0 ? (
						pendingNotifications.map((notif, index) => (
							<View key={notif.identifier} style={styles.pendingItem}>
								<Text style={styles.label}>ID: {notif.identifier}</Text>
								<Text style={styles.label}>Title: {notif.content.title}</Text>
								<Text style={styles.label}>Body: {notif.content.body}</Text>
								<Text style={styles.label}>
									Trigger:{" "}
									{notif.trigger ? JSON.stringify(notif.trigger) : "Immediate"}
								</Text>
							</View>
						))
					) : (
						<Text style={styles.infoText}>No pending notifications</Text>
					)}
				</View>

				<View style={styles.buttonContainer}>
					<Button
						title="Send Push Notification"
						onPress={sendTestNotification}
					/>
				</View>

				<View style={styles.buttonContainer}>
					<Button
						title="Schedule Test Notification"
						onPress={scheduleTestNotification}
					/>
				</View>

				<View style={styles.buttonContainer}>
					<Button
						title="Schedule Expiry Notification"
						onPress={scheduleExpiryNotification}
					/>
				</View>

				<View style={styles.buttonContainer}>
					<Button
						title="Cancel All Notifications"
						onPress={cancelAllNotifications}
					/>
				</View>

				<View style={styles.buttonContainer}>
					<Button title="Refresh Pending" onPress={loadPendingNotifications} />
				</View>

				{onClose && (
					<View style={styles.buttonContainer}>
						<Button title="Close Debugger" onPress={onClose} color="#FF6B6B" />
					</View>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: "#f5f5f5",
	},
	scrollView: {
		flex: 1,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
	},
	section: {
		backgroundColor: "white",
		borderRadius: 8,
		padding: 16,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 12,
		color: "#22c55e",
	},
	tokenText: {
		padding: 8,
		backgroundColor: "#f0f0f0",
		borderRadius: 4,
		fontSize: 12,
		fontFamily: "monospace",
	},
	label: {
		fontSize: 14,
		marginBottom: 4,
	},
	infoText: {
		fontSize: 14,
		color: "#666",
		fontStyle: "italic",
	},
	pendingItem: {
		borderLeftWidth: 3,
		borderLeftColor: "#22c55e",
		paddingLeft: 8,
		marginBottom: 12,
	},
	buttonContainer: {
		marginBottom: 12,
	},
});
