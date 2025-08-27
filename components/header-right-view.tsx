import * as Updates from "expo-updates";
import * as React from "react";
import { ActivityIndicator } from "react-native";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { ThemeToggle } from "./theme-toggle";

export function HeaderRightView() {
	const { isUpdateAvailable, isUpdatePending, isDownloading } =
		Updates.useUpdates();

	async function onReload() {
		try {
			if (!isUpdatePending) {
				await Updates.fetchUpdateAsync();
			}
			await Updates.reloadAsync();
		} catch (error) {
			console.error(error);
		}
	}

	if (isUpdateAvailable) {
		return (
			<Button
				size="sm"
				className="h-7 rounded-full bg-sky-500 dark:bg-sky-600"
				onPress={onReload}
				disabled={isDownloading}
			>
				{isDownloading ? (
					<ActivityIndicator color="white" size="small" className="scale-75" />
				) : (
					<Text className="text-white">Update</Text>
				)}
			</Button>
		);
	}

	return <ThemeToggle />;
}
