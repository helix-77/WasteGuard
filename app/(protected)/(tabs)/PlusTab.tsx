//! Quick Scan Feature integrated with CameraScanner

import React, { useState, useCallback, useMemo, useRef } from "react";
import { View, Alert, ScrollView, Image, Keyboard } from "react-native";
import { SafeAreaView } from "../../../components/safe-area-view";
import { Text } from "../../../components/ui/text";
import { Button } from "../../../components/ui/button";
import ProductForm, {
	ProductFormData,
	ProductFormRef,
} from "../../../components/product/ProductForm";
import { Card } from "../../../components/ui/card";
import { Camera, CheckCircle, AlertCircle } from "lucide-react-native";
import { H4, Muted } from "../../../components/ui/typography";
import { useRouter } from "expo-router";
import CameraScanner from "@/components/product/CameraScanner";
import { useCameraContext } from "@/context/camera-context";

interface ScanStatus {
	image: string | null;
	isComplete: boolean;
}

export default function PlusTab() {
	const router = useRouter();
	const productFormRef = useRef<ProductFormRef>(null);
	const [showCamera, setShowCamera] = useState(false);
	const { setIsCameraOpen } = useCameraContext();

	const [scanStatus, setScanStatus] = useState<ScanStatus>({
		image: null,
		isComplete: false,
	});
	const [isLoading, setIsLoading] = useState(false);

	// Memoized computed values
	const hasImageData = useMemo(
		() => Boolean(scanStatus.image),
		[scanStatus.image],
	);
	const scanProgress = useMemo(() => {
		return hasImageData ? 100 : 0;
	}, [hasImageData]);

	// Camera handlers
	const handleOpenCamera = useCallback(() => {
		Keyboard.dismiss();
		setShowCamera(true);
		setIsCameraOpen(true);
	}, [setIsCameraOpen]);

	const handleCloseCamera = useCallback(() => {
		setShowCamera(false);
		setIsCameraOpen(false);
	}, [setIsCameraOpen]);

	const handleImageCaptured = useCallback(
		(imageUri: string) => {
			setScanStatus((prev) => ({
				...prev,
				image: imageUri,
				isComplete: true, // Complete when image is captured
			}));

			// Show success alert
			Alert.alert("Photo Captured!", "Photo has been saved successfully.", [
				{
					text: "Continue",
					onPress: () => {
						setShowCamera(false);
						setIsCameraOpen(false);
					},
				},
			]);

			// console.log("Image captured:", imageUri);
		},
		[setIsCameraOpen],
	);

	// Reset scan data
	const handleResetScan = useCallback(() => {
		setScanStatus({
			image: null,
			isComplete: false,
		});
	}, []);

	// Optimized form submission with proper error handling
	const handleSaveProduct = useCallback(
		async (productData: ProductFormData) => {
			if (isLoading) return; // Prevent double submission

			try {
				setIsLoading(true);

				// Add the captured image to the product data
				const productWithImage = {
					...productData,
					imageUri: scanStatus.image,
				};

				// TODO: Replace with actual Supabase integration
				await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
				console.log("Saving product:", productWithImage);

				Alert.alert(
					"Success!",
					"Your product has been added to your inventory.",
					[
						{
							text: "Add Another",
							style: "default",
							onPress: () => {
								setScanStatus({
									image: null,
									isComplete: false,
								});
								// Reset the form
								productFormRef.current?.resetForm();
							},
						},
						{
							text: "View Inventory",
							style: "default",
							onPress: () => {
								// Reset the form
								productFormRef.current?.resetForm();
								router.push("/products");
							},
						},
					],
				);
			} catch (error) {
				console.error("Error saving product:", error);
				Alert.alert(
					"Error",
					"There was an error saving your product. Please try again.",
				);
			} finally {
				setIsLoading(false);
			}
		},
		[isLoading, scanStatus, router],
	);

	// Render scan status indicator
	const renderScanStatus = () => (
		<View className="flex-row items-center justify-between mb-4">
			<View className="flex-row items-center">
				{scanProgress === 100 ? (
					<CheckCircle size={20} color="#22c55e" />
				) : (
					<AlertCircle size={20} color="#f59e0b" />
				)}
				<Text className="ml-2 font-medium">Scan Progress: {scanProgress}%</Text>
			</View>
			{scanProgress > 0 && (
				<Button
					variant="outline"
					size="sm"
					onPress={handleResetScan}
					className="py-1 px-3"
				>
					<Text className="text-xs">Reset</Text>
				</Button>
			)}
		</View>
	);

	// Render captured image preview
	const renderImagePreview = () => {
		if (!hasImageData) return null;

		return (
			<View className="mb-4">
				<Text className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
					Captured Image:
				</Text>
				<Image
					source={{ uri: scanStatus.image! }}
					className="w-full h-48 rounded-lg"
					resizeMode="cover"
				/>
			</View>
		);
	};

	return (
		<SafeAreaView className="flex-1">
			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				<View className="p-4">
					<H4 className="mb-6 text-center text-gray-900 dark:text-gray-100">
						New Item
					</H4>

					<Card className="mb-6 p-5 shadow-sm">
						{renderScanStatus()}

						<View className="flex-row justify-between items-center mb-4">
							<View className="flex-row items-center">
								<H4 className="text-gray-900 dark:text-gray-100">Quick Scan</H4>
								<Text className="text-xs text-muted-foreground ml-1">
									(optional)
								</Text>
							</View>
							<View className="flex-row items-center">
								{hasImageData && (
									<View className="flex-row items-center">
										<CheckCircle size={16} color="#22c55e" />
										<Muted className="ml-1 text-green-600">Photo ✓</Muted>
									</View>
								)}
								{!hasImageData && (
									<Muted className="text-gray-500">Ready to scan</Muted>
								)}
							</View>
						</View>

						<Text className="mb-4 text-gray-600 dark:text-gray-400 leading-5">
							Take a photo to help identify your items later.
						</Text>

						{/* Show captured data */}
						{renderImagePreview()}

						<View className="flex-row gap-3 mb-4">
							<Button
								className="flex-1 bg-green-600 active:bg-green-700"
								onPress={handleOpenCamera}
								disabled={isLoading}
							>
								<View className="flex-row items-center justify-center">
									<Camera size={18} color="#fff" />
									<Text className="text-white font-medium ml-2">
										{hasImageData ? "Retake Photo" : "Take Photo"}
									</Text>
								</View>
							</Button>
						</View>
					</Card>

					{/* Product Form */}
					<ProductForm
						ref={productFormRef}
						initialImageUri={scanStatus.image || undefined}
						onSave={handleSaveProduct}
						onOpenCamera={() => handleOpenCamera}
						isLoading={isLoading}
					/>
				</View>
			</ScrollView>

			{/* Camera Scanner Modal */}
			<CameraScanner
				isVisible={showCamera}
				onClose={handleCloseCamera}
				onImageCaptured={handleImageCaptured}
			/>
		</SafeAreaView>
	);
}
