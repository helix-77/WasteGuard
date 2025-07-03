import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

export default function Profile() {
	const { signOut } = useAuth();

	const [facing, setFacing] = useState<CameraType>("back");
	const [permission, requestPermission] = useCameraPermissions();

	if (!permission) {
		// Camera permissions are still loading.
		return <View />;
	}

	if (!permission.granted) {
		// Camera permissions are not granted yet.
		return (
			<View style={styles.container}>
				<Text style={styles.message}>
					We need your permission to show the camera
				</Text>
				<Button onPress={requestPermission} title="grant permission" />
			</View>
		);
	}

	function toggleCameraFacing() {
		setFacing((current) => (current === "back" ? "front" : "back"));
	}

	return (
		<View style={styles.container}>
			<CameraView style={styles.camera} facing={facing}>
				<View style={styles.buttonContainer}>
					<TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
						<Text style={styles.text}>Flip Camera</Text>
					</TouchableOpacity>
				</View>
			</CameraView>
		</View>
		// <View className="flex-1 items-center justify-center bg-background p-4 gap-y-4">
		// 	<H1 className="text-center">Sign Out</H1>
		// 	<Muted className="text-center">
		// 		Sign out and return to the welcome screen.
		// 	</Muted>
		// 	<View className="w-full h-0.5 bg-border my-4">
		// 		<ThemeToggle />
		// 	</View>
		// 	<Button
		// 		className="w-full"
		// 		size="default"
		// 		variant="default"
		// 		onPress={async () => {
		// 			await signOut();
		// 		}}
		// 	>
		// 		<Text>Sign Out</Text>
		// 	</Button>
		// </View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
	},
	message: {
		textAlign: "center",
		paddingBottom: 10,
	},
	camera: {
		flex: 1,
	},
	buttonContainer: {
		flex: 1,
		flexDirection: "row",
		backgroundColor: "transparent",
		margin: 64,
	},
	button: {
		flex: 1,
		alignSelf: "flex-end",
		alignItems: "center",
	},
	text: {
		fontSize: 24,
		fontWeight: "bold",
		color: "white",
	},
});
