import React, { useState, useEffect, useRef, useCallback } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	Animated,
	Vibration,
	Platform,
	Dimensions,
} from "react-native";
import {
	CameraView,
	BarcodeScanningResult,
	useCameraPermissions,
} from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { Text as CustomText } from "../ui/text";
import { LinearGradient } from "expo-linear-gradient";

interface ProductCameraProps {
	onBarcodeScanned: (barcodeData: string) => void;
	onImageCaptured: (imageUri: string) => void;
	onClose: () => void;
}

const { width: screenWidth } = Dimensions.get("window");
const SCAN_AREA_SIZE = Math.min(screenWidth - 80, 280);

export default function ProductCamera({
	onBarcodeScanned,
	onImageCaptured,
	onClose,
}: ProductCameraProps) {
	const [isScanning, setIsScanning] = useState<boolean>(true);
	const [isTakingPicture, setIsTakingPicture] = useState<boolean>(false);
	const [hasScannedBarcode, setHasScannedBarcode] = useState<boolean>(false);
	const [flashMode, setFlashMode] = useState<"off" | "on">("off");
	const [countdown, setCountdown] = useState<number>(0);

	// Animation values
	const scanLineAnim = useRef(new Animated.Value(0)).current;
	const pulseAnim = useRef(new Animated.Value(1)).current;
	const fadeAnim = useRef(new Animated.Value(0)).current;

	// Use the camera permissions hook
	const [permission, requestPermission] = useCameraPermissions();
	const cameraRef = useRef<CameraView>(null);
	const scanTimeoutRef = useRef<NodeJS.Timeout>();

	// Start scanning animation
	useEffect(() => {
		if (isScanning) {
			// Scanning line animation
			const scanAnimation = Animated.loop(
				Animated.sequence([
					Animated.timing(scanLineAnim, {
						toValue: 1,
						duration: 2000,
						useNativeDriver: true,
					}),
					Animated.timing(scanLineAnim, {
						toValue: 0,
						duration: 0,
						useNativeDriver: true,
					}),
				]),
			);
			scanAnimation.start();

			// Pulse animation for scan area
			const pulseAnimation = Animated.loop(
				Animated.sequence([
					Animated.timing(pulseAnim, {
						toValue: 1.05,
						duration: 1000,
						useNativeDriver: true,
					}),
					Animated.timing(pulseAnim, {
						toValue: 1,
						duration: 1000,
						useNativeDriver: true,
					}),
				]),
			);
			pulseAnimation.start();

			return () => {
				scanAnimation.stop();
				pulseAnimation.stop();
			};
		}
	}, [isScanning, scanLineAnim, pulseAnim]);

	// Fade in animation
	useEffect(() => {
		Animated.timing(fadeAnim, {
			toValue: 1,
			duration: 300,
			useNativeDriver: true,
		}).start();
	}, [fadeAnim]);

	// Request camera permissions on component mount
	useEffect(() => {
		if (permission?.granted === false) {
			requestPermission();
		}
	}, [permission, requestPermission]);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (scanTimeoutRef.current) {
				clearTimeout(scanTimeoutRef.current);
			}
		};
	}, []);

	const handleBarCodeScanned = useCallback(
		(result: BarcodeScanningResult) => {
			if (isScanning && !hasScannedBarcode) {
				setIsScanning(false);
				setHasScannedBarcode(true);

				// Haptic feedback
				if (Platform.OS === "ios") {
					Vibration.vibrate();
				} else {
					Vibration.vibrate(100);
				}

				// Success feedback
				onBarcodeScanned(result.data);

				// Auto-capture photo after successful barcode scan
				setCountdown(3);
				const countdownInterval = setInterval(() => {
					setCountdown((prev) => {
						if (prev <= 1) {
							clearInterval(countdownInterval);
							takePicture();
							return 0;
						}
						return prev - 1;
					});
				}, 1000);
			}
		},
		[isScanning, hasScannedBarcode, onBarcodeScanned],
	);

	const takePicture = useCallback(async () => {
		if (!isTakingPicture && cameraRef.current) {
			try {
				setIsTakingPicture(true);
				const photo = await cameraRef.current.takePictureAsync({
					quality: 0.8,
					skipProcessing: false,
				});

				if (photo?.uri) {
					onImageCaptured(photo.uri);

					// Success haptic feedback
					if (Platform.OS === "ios") {
						Vibration.vibrate();
					}
				}
			} catch (error) {
				console.error("Error taking picture:", error);
				Alert.alert(
					"Camera Error",
					"Failed to take picture. Please try again.",
					[{ text: "OK" }],
				);
			} finally {
				setIsTakingPicture(false);
			}
		}
	}, [isTakingPicture, onImageCaptured]);

	const handleManualCapture = useCallback(() => {
		setIsScanning(false);
		setCountdown(0);
		takePicture();
	}, [takePicture]);

	const toggleFlash = useCallback(() => {
		setFlashMode((prev) => (prev === "off" ? "on" : "off"));
	}, []);

	const resetScanning = useCallback(() => {
		setIsScanning(true);
		setHasScannedBarcode(false);
		setCountdown(0);
	}, []);

	// Loading state
	if (!permission) {
		return (
			<View className="flex-1 items-center justify-center bg-gray-900">
				<ActivityIndicator size="large" color="#22c55e" />
				<CustomText className="text-white mt-4">Loading camera...</CustomText>
			</View>
		);
	}

	// Permission denied state
	if (!permission.granted) {
		return (
			<Animated.View
				style={{ opacity: fadeAnim }}
				className="flex-1 items-center justify-center p-6 bg-gray-900"
			>
				<View className="items-center bg-gray-800 p-8 rounded-2xl">
					<Ionicons name="camera-outline" size={64} color="#6b7280" />
					<CustomText className="text-white text-xl font-semibold mb-2 text-center">
						Camera Access Required
					</CustomText>
					<CustomText className="text-gray-300 text-center mb-6 leading-6">
						We need camera permission to scan barcodes and take photos of your
						products.
					</CustomText>
					<TouchableOpacity
						className="bg-green-600 py-4 px-8 rounded-xl shadow-lg active:bg-green-700"
						onPress={requestPermission}
					>
						<Text className="text-white font-semibold text-lg">
							Grant Permission
						</Text>
					</TouchableOpacity>
					<TouchableOpacity className="mt-4 py-2" onPress={onClose}>
						<Text className="text-gray-400">Cancel</Text>
					</TouchableOpacity>
				</View>
			</Animated.View>
		);
	}

	return (
		<View className="flex-1">
			<CameraView
				ref={cameraRef}
				className="flex-1"
				facing="back"
				flash={flashMode}
				barcodeScannerSettings={{
					barcodeTypes: [
						"ean13",
						"ean8",
						"upc_a",
						"upc_e",
						"code128",
						"code39",
						"code93",
						"codabar",
						"qr",
						"pdf417",
					],
				}}
				onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
			>
				<Animated.View
					style={{ opacity: fadeAnim }}
					className="flex-1 bg-transparent"
				>
					{/* Overlay with scan area */}
					<View className="flex-1 justify-center items-center">
						{/* Dark overlay */}
						<View className="absolute inset-0 bg-black bg-opacity-50" />

						{/* Scan area */}
						<Animated.View
							style={{
								transform: [{ scale: pulseAnim }],
								width: SCAN_AREA_SIZE,
								height: SCAN_AREA_SIZE,
							}}
							className="relative"
						>
							{/* Transparent center */}
							<View
								className="absolute inset-0 border-2 border-white rounded-2xl"
								style={{
									shadowColor: "#000",
									shadowOffset: { width: 0, height: 2 },
									shadowOpacity: 0.8,
									shadowRadius: 4,
								}}
							/>

							{/* Corner indicators */}
							<View className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-green-500 rounded-tl-lg" />
							<View className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-green-500 rounded-tr-lg" />
							<View className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-green-500 rounded-bl-lg" />
							<View className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-green-500 rounded-br-lg" />

							{/* Scanning line */}
							{isScanning && (
								<Animated.View
									style={{
										transform: [
											{
												translateY: scanLineAnim.interpolate({
													inputRange: [0, 1],
													outputRange: [0, SCAN_AREA_SIZE - 4],
												}),
											},
										],
									}}
									className="absolute top-0 left-0 right-0 h-1 bg-green-500 opacity-80"
								/>
							)}
						</Animated.View>
					</View>

					{/* Status indicator */}
					<View className="absolute top-16 left-0 right-0 items-center">
						<View className="bg-black bg-opacity-70 px-6 py-3 rounded-full">
							{countdown > 0 ? (
								<CustomText className="text-white text-lg font-semibold">
									Taking photo in {countdown}...
								</CustomText>
							) : hasScannedBarcode ? (
								<View className="flex-row items-center">
									<Ionicons name="checkmark-circle" size={20} color="#22c55e" />
									<CustomText className="text-green-400 ml-2 font-medium">
										Barcode scanned! ✓
									</CustomText>
								</View>
							) : isScanning ? (
								<View className="flex-row items-center">
									<ActivityIndicator size="small" color="#22c55e" />
									<CustomText className="text-white ml-2">
										Scanning for barcode...
									</CustomText>
								</View>
							) : (
								<CustomText className="text-white">
									Tap the button to take a photo
								</CustomText>
							)}
						</View>
					</View>

					{/* Bottom controls */}
					<LinearGradient
						colors={["transparent", "rgba(0,0,0,0.8)"]}
						className="absolute bottom-0 left-0 right-0 pb-8 pt-16"
					>
						<View className="flex-row justify-between items-center px-6">
							{/* Close button */}
							<TouchableOpacity
								className="bg-gray-800 bg-opacity-80 p-4 rounded-full"
								onPress={onClose}
								accessibilityLabel="Close camera"
							>
								<Ionicons name="close" size={28} color="white" />
							</TouchableOpacity>

							{/* Capture button */}
							<TouchableOpacity
								className={`${isTakingPicture ? "bg-gray-600" : "bg-white"} rounded-full p-2 shadow-lg`}
								onPress={handleManualCapture}
								disabled={isTakingPicture}
								accessibilityLabel="Take picture"
							>
								{isTakingPicture ? (
									<View className="w-16 h-16 items-center justify-center">
										<ActivityIndicator size="large" color="#22c55e" />
									</View>
								) : (
									<View className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 shadow-inner" />
								)}
							</TouchableOpacity>

							{/* Flash/Scan toggle */}
							<View className="items-center">
								<TouchableOpacity
									className="bg-gray-800 bg-opacity-80 p-4 rounded-full mb-2"
									onPress={toggleFlash}
									accessibilityLabel={`Turn flash ${flashMode === "off" ? "on" : "off"}`}
								>
									<Ionicons
										name={flashMode === "off" ? "flash-off" : "flash"}
										size={24}
										color={flashMode === "off" ? "white" : "#fbbf24"}
									/>
								</TouchableOpacity>

								{hasScannedBarcode && (
									<TouchableOpacity
										className="bg-green-600 bg-opacity-90 px-3 py-2 rounded-full"
										onPress={resetScanning}
										accessibilityLabel="Rescan barcode"
									>
										<Text className="text-white text-xs font-medium">
											Rescan
										</Text>
									</TouchableOpacity>
								)}
							</View>
						</View>
					</LinearGradient>

					{/* Help text */}
					<View className="absolute bottom-32 left-0 right-0 items-center">
						<View className="bg-black bg-opacity-60 px-4 py-2 rounded-full">
							<CustomText className="text-white text-sm text-center">
								{isScanning
									? "Position barcode within the frame"
									: "Perfect! Now take a photo of your product"}
							</CustomText>
						</View>
					</View>
				</Animated.View>
			</CameraView>
		</View>
	);
}
