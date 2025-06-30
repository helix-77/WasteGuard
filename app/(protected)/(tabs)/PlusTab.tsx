//! Quick Scan Feature is optional

import React, { useState, useCallback, useMemo } from "react";
import { View, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "../../../components/safe-area-view";
import { Text } from "../../../components/ui/text";
import { Button } from "../../../components/ui/button";
import ProductCamera from "../../../components/product/ProductCamera";
import ProductForm, {
	ProductFormData,
} from "../../../components/product/ProductForm";
import { Card } from "../../../components/ui/card";
import { Camera, Scan, CheckCircle, AlertCircle } from "lucide-react-native";
import { H4, Muted } from "../../../components/ui/typography";
import { useRouter } from "expo-router";

interface ScanStatus {
	barcode: string | null;
	image: string | null;
	isComplete: boolean;
}

export default function PlusTab() {
	const router = useRouter();
	const [showCamera, setShowCamera] = useState(false);
	const [scanStatus, setScanStatus] = useState<ScanStatus>({
		barcode: null,
		image: null,
		isComplete: false,
	});
	const [isLoading, setIsLoading] = useState(false);

	// Memoized computed values
	const hasBarcodeData = useMemo(
		() => Boolean(scanStatus.barcode),
		[scanStatus.barcode],
	);
	const hasImageData = useMemo(
		() => Boolean(scanStatus.image),
		[scanStatus.image],
	);
	const scanProgress = useMemo(() => {
		let progress = 0;
		if (hasBarcodeData) progress += 50;
		if (hasImageData) progress += 50;
		return progress;
	}, [hasBarcodeData, hasImageData]);

	// Optimized camera handlers with useCallback
	const handleOpenCamera = useCallback(() => {
		setShowCamera(true);
	}, []);

	const handleBarcodeScanned = useCallback((barcodeData: string) => {
		setScanStatus((prev) => ({
			...prev,
			barcode: barcodeData,
			isComplete: Boolean(prev.image), // Complete if image already exists
		}));

		// Optional: Fetch product details from barcode API
		// fetchProductDetails(barcodeData);
		console.log("Barcode scanned:", barcodeData);
	}, []);

	const handleImageCaptured = useCallback((imageUri: string) => {
		setScanStatus((prev) => ({
			...prev,
			image: imageUri,
			isComplete: Boolean(prev.barcode), // Complete if barcode already exists
		}));
		setShowCamera(false);
	}, []);

	const handleCloseCamera = useCallback(() => {
		setShowCamera(false);
	}, []);

	// Reset scan data
	const handleResetScan = useCallback(() => {
		setScanStatus({
			barcode: null,
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
					barcode: scanStatus.barcode || productData.barcode,
				};

				// TODO: Replace with actual Supabase integration
				await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
				console.log("Saving product:", productWithImage);

				Alert.alert(
					"Success! 🎉",
					"Your product has been added to your inventory.",
					[
						{
							text: "Add Another",
							style: "default",
							onPress: () => {
								setScanStatus({
									barcode: null,
									image: null,
									isComplete: false,
								});
							},
						},
						{
							text: "View Inventory",
							style: "default",
							onPress: () => {
								router.push("/(protected)/(tabs)/home");
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

	return (
		<SafeAreaView className="flex-1">
			{showCamera ? (
				<ProductCamera
					onBarcodeScanned={handleBarcodeScanned}
					onImageCaptured={handleImageCaptured}
					onClose={handleCloseCamera}
				/>
			) : (
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
									<H4 className="text-gray-900 dark:text-gray-100">
										Quick Scan
									</H4>
									<Text className="text-xs text-muted-foreground ml-1">
										(optional)
									</Text>
								</View>
								<View className="flex-row items-center">
									{hasBarcodeData && (
										<View className="flex-row items-center mr-3">
											<CheckCircle size={16} color="#22c55e" />
											<Muted className="ml-1 text-green-600">Barcode ✓</Muted>
										</View>
									)}
									{hasImageData && (
										<View className="flex-row items-center">
											<CheckCircle size={16} color="#22c55e" />
											<Muted className="ml-1 text-green-600">Photo ✓</Muted>
										</View>
									)}
									{!hasBarcodeData && !hasImageData && (
										<Muted className="text-gray-500">Ready to scan</Muted>
									)}
								</View>
							</View>

							<Text className="mb-4 text-gray-600 dark:text-gray-400 leading-5">
								Scan the barcode to auto-fill product details and take a photo
								to help identify your items later.
							</Text>

							<View className="flex-row gap-3">
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
								<Button
									className="flex-1 border-green-600"
									variant="outline"
									onPress={handleOpenCamera}
									disabled={isLoading}
								>
									<View className="flex-row items-center justify-center">
										<Scan size={18} color="#16a34a" />
										<Text className="text-green-600 font-medium ml-2">
											{hasBarcodeData ? "Rescan" : "Scan Code"}
										</Text>
									</View>
								</Button>
							</View>
						</Card>

						{/* Product Form */}
						<ProductForm
							initialBarcode={scanStatus.barcode || undefined}
							initialImageUri={scanStatus.image || undefined}
							onSave={handleSaveProduct}
							onOpenCamera={handleOpenCamera}
							isLoading={isLoading}
						/>
					</View>
				</ScrollView>
			)}
		</SafeAreaView>
	);
}
