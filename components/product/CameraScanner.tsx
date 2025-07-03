import React, { useState, useRef, useCallback } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Text } from "../ui/text";
import { Button } from "../ui/button";
import { X, Camera, RotateCcw, Zap, ZapOff } from "lucide-react-native";
import { SafeAreaView } from "../safe-area-view";

interface CameraScannerProps {
	isVisible: boolean;
	onClose: () => void;
	onImageCaptured: (imageUri: string) => void;
}

export default function CameraScanner({
	isVisible,
	onClose,
	onImageCaptured,
}: CameraScannerProps) {
	const [facing, setFacing] = useState<CameraType>("back");
	const [flash, setFlash] = useState(false);
	const [isCapturing, setIsCapturing] = useState(false);
	const [permission, requestPermission] = useCameraPermissions();
	const cameraRef = useRef<CameraView>(null);

	// Handle photo capture
	const handleTakePhoto = useCallback(async () => {
		if (!cameraRef.current || isCapturing) return;

		try {
			setIsCapturing(true);
			const photo = await cameraRef.current.takePictureAsync({
				quality: 0.8,
				base64: false,
				skipProcessing: false,
			});

			if (photo?.uri) {
				onImageCaptured(photo.uri);
			}
		} catch (error) {
			console.error("Error taking photo:", error);
			Alert.alert("Error", "Failed to take photo. Please try again.");
		} finally {
			setIsCapturing(false);
		}
	}, [isCapturing, onImageCaptured]);

	// Toggle camera facing
	const toggleCameraFacing = useCallback(() => {
		setFacing((current) => (current === "back" ? "front" : "back"));
	}, []);

	// Toggle flash
	const toggleFlash = useCallback(() => {
		setFlash((current) => !current);
	}, []);

	// Early returns after all hooks
	if (!isVisible) {
		return null;
	}

	// Handle camera permissions
	if (!permission) {
		return <View />;
	}

	if (!permission.granted) {
		return (
			<View style={styles.permissionContainer}>
				<Text style={styles.permissionText}>
					We need camera permission to take photos
				</Text>
				<Button onPress={requestPermission}>
					<Text style={styles.buttonText}>Grant Permission</Text>
				</Button>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<SafeAreaView style={styles.safeArea}>
				<CameraView
					ref={cameraRef}
					style={styles.camera}
					facing={facing}
					flash={flash ? "on" : "off"}
				/>

				{/* Header with close button - positioned absolutely */}
				<View style={styles.header}>
					<Button
						variant="ghost"
						size="sm"
						onPress={onClose}
						style={styles.closeButton}
					>
						<X size={24} color="#fff" />
					</Button>
					<Text style={styles.headerText}>Take Photo</Text>
					<View style={styles.headerSpacer} />
				</View>

				{/* Bottom controls - positioned absolutely */}
				<View style={styles.bottomControls}>
					<View style={styles.controlsRow}>
						{/* Flash toggle */}
						<Button
							variant="ghost"
							size="sm"
							onPress={toggleFlash}
							style={styles.controlButton}
						>
							{flash ? (
								<Zap size={24} color="#fff" />
							) : (
								<ZapOff size={24} color="#fff" />
							)}
						</Button>

						{/* Capture button */}
						<Button
							onPress={handleTakePhoto}
							disabled={isCapturing}
							style={[
								styles.captureButton,
								isCapturing && styles.captureButtonDisabled,
							]}
						>
							<Camera size={32} color="#fff" />
						</Button>

						{/* Camera flip */}
						<Button
							variant="ghost"
							size="sm"
							onPress={toggleCameraFacing}
							style={styles.controlButton}
						>
							<RotateCcw size={24} color="#fff" />
						</Button>
					</View>

					{/* Mode indicator */}
					<Text style={styles.modeIndicator}>Photo Mode</Text>
				</View>
			</SafeAreaView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 1000,
		backgroundColor: "#000",
	},
	safeArea: {
		flex: 1,
	},
	camera: {
		flex: 1,
	},
	permissionContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#000",
		padding: 20,
	},
	permissionText: {
		color: "#fff",
		textAlign: "center",
		marginBottom: 20,
		fontSize: 16,
	},
	buttonText: {
		color: "#fff",
		fontWeight: "600",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingTop: 10,
		paddingBottom: 20,
		backgroundColor: "rgba(0, 0, 0, 0.3)",
	},
	closeButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	headerText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "600",
	},
	headerSpacer: {
		width: 40,
	},
	bottomControls: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		paddingBottom: 40,
		paddingTop: 20,
	},
	controlsRow: {
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		marginBottom: 10,
	},
	controlButton: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		justifyContent: "center",
		alignItems: "center",
	},
	captureButton: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: "#fff",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 4,
		borderColor: "rgba(255, 255, 255, 0.3)",
	},
	captureButtonDisabled: {
		opacity: 0.5,
	},
	modeIndicator: {
		color: "#fff",
		fontSize: 14,
		textAlign: "center",
		opacity: 0.8,
	},
});
