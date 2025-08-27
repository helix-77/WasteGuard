import React, { useState, useCallback, useEffect } from "react";
import {
	View,
	Text,
	Image,
	Alert,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import {
	AlertCircle,
	CalendarClock,
	Clock,
	Trash2,
	CheckCircle,
} from "lucide-react-native";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { BottomSheet } from "./bottom-sheet";
import { Package, Tag, Info } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { ProductService } from "@/lib/services/productService";
import { useMarkProductAsUsed } from "@/lib/hooks/useProductsQuery";

interface ProductDetailsProps {
	product: ProductItem | null;
	onClose: () => void;
	onDelete?: (productId: string) => void;
}

interface ProductItem {
	id: string;
	name: string;
	category: string;
	expiryDate: string;
	daysLeft: number;
	imageUrl?: string;
	quantity?: number;
	notes?: string;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
	product,
	onClose,
	onDelete,
}) => {
	const [cachedImageUri, setCachedImageUri] = useState<string | null>(null);
	const [imageLoading, setImageLoading] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isMarkingAsUsed, setIsMarkingAsUsed] = useState(false);

	// TanStack Query hook for marking product as used
	const markAsUsedMutation = useMarkProductAsUsed();

	// Handle marking product as used
	const markProductAsUsedWithQuantity = useCallback(
		async (quantityUsed?: number) => {
			if (!product) return;

			try {
				setIsMarkingAsUsed(true);
				await markAsUsedMutation.mutateAsync({
					productId: product.id,
					quantityUsed,
				});

				// If all quantity was used, close the bottom sheet
				if (!quantityUsed || quantityUsed >= (product.quantity || 1)) {
					onClose();
				}
			} catch (error) {
				console.error("Failed to mark product as used:", error);
				Alert.alert(
					"Error",
					"Failed to mark product as used. Please try again.",
					[{ text: "OK" }],
				);
			} finally {
				setIsMarkingAsUsed(false);
			}
		},
		[product, markAsUsedMutation, onClose],
	);

	const handleMarkAsUsed = useCallback(async () => {
		if (!product) return;

		// If product has quantity > 1, show options for partial or full usage
		if (product.quantity && product.quantity > 1) {
			Alert.alert(
				"Mark as Used",
				`How many items of "${product.name}" did you use?`,
				[
					{
						text: "Cancel",
						style: "cancel",
					},
					{
						text: "Use 1 item",
						onPress: () => markProductAsUsedWithQuantity(1),
					},
					{
						text: "Use all items",
						onPress: () => markProductAsUsedWithQuantity(product.quantity!),
					},
				],
				{ cancelable: true },
			);
		} else {
			Alert.alert(
				"Mark as Used",
				`Mark "${product.name}" as used?`,
				[
					{
						text: "Cancel",
						style: "cancel",
					},
					{
						text: "Mark as Used",
						onPress: () => markProductAsUsedWithQuantity(),
					},
				],
				{ cancelable: true },
			);
		}
	}, [product, markProductAsUsedWithQuantity]);

	// Handle deletion with confirmation
	const handleDelete = useCallback(async () => {
		if (!product) return;

		Alert.alert(
			"Delete Product",
			`Are you sure you want to delete "${product.name}"?`,
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							setIsDeleting(true);
							await ProductService.deleteProduct(product.id);
							// Call the onDelete callback if provided
							if (onDelete) {
								onDelete(product.id);
							}
							onClose();
						} catch (error) {
							console.error("Failed to delete product:", error);
							Alert.alert(
								"Error",
								"Failed to delete product. Please try again.",
								[{ text: "OK" }],
							);
						} finally {
							setIsDeleting(false);
						}
					},
				},
			],
			{ cancelable: true },
		);
	}, [product, onDelete, onClose]);

	// AsyncStorage keys for image caching
	const getImageCacheKey = (imageUrl: string) => `cached_image_${imageUrl}`;
	const getImageMetadataKey = (imageUrl: string) =>
		`image_metadata_${imageUrl}`;

	/**
	 * Enhanced image caching with AsyncStorage for better UX
	 * Stores both the cached file URI and metadata for cache management
	 */
	const cacheImageWithAsyncStorage = useCallback(
		async (imageUrl: string): Promise<string> => {
			try {
				setImageLoading(true);

				// Check if image is already cached in AsyncStorage
				const cacheKey = getImageCacheKey(imageUrl);
				const metadataKey = getImageMetadataKey(imageUrl);

				const cachedUri = await AsyncStorage.getItem(cacheKey);
				const metadata = await AsyncStorage.getItem(metadataKey);

				if (cachedUri && metadata) {
					const { timestamp, originalUrl } = JSON.parse(metadata);

					// Check if cached file still exists and is not too old (7 days)
					const fileInfo = await FileSystem.getInfoAsync(cachedUri);
					const isExpired = Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000; // 7 days

					if (fileInfo.exists && !isExpired && originalUrl === imageUrl) {
						setImageLoading(false);
						return cachedUri;
					} else {
						// Clean up expired or invalid cache
						await AsyncStorage.removeItem(cacheKey);
						await AsyncStorage.removeItem(metadataKey);
						if (fileInfo.exists) {
							await FileSystem.deleteAsync(cachedUri, {
								idempotent: true,
							});
						}
					}
				}

				// Download and cache new image
				const filename =
					imageUrl.split("/").pop()?.split("?")[0] || `image_${Date.now()}`;
				const fileExtension = filename.includes(".") ? "" : ".jpg";
				const fileUri = `${FileSystem.cacheDirectory}wasteguard_${Date.now()}_${filename}${fileExtension}`;

				const downloadResult = await FileSystem.downloadAsync(
					imageUrl,
					fileUri,
				);

				if (downloadResult.status === 200) {
					// Store in AsyncStorage for future reference
					await AsyncStorage.setItem(cacheKey, downloadResult.uri);

					// Get file info safely
					const fileInfo = await FileSystem.getInfoAsync(downloadResult.uri);
					const fileSize =
						fileInfo.exists && "size" in fileInfo ? fileInfo.size : 0;

					await AsyncStorage.setItem(
						metadataKey,
						JSON.stringify({
							timestamp: Date.now(),
							originalUrl: imageUrl,
							size: fileSize,
						}),
					);

					setImageLoading(false);
					return downloadResult.uri;
				} else {
					throw new Error(
						`Download failed with status: ${downloadResult.status}`,
					);
				}
			} catch (error) {
				console.warn("Failed to cache image:", error);
				setImageLoading(false);
				// Return original URL as fallback
				return imageUrl;
			}
		},
		[],
	);

	/**
	 * Preload image immediately when product is available
	 * This improves perceived performance
	 */
	const preloadImage = useCallback(
		async (imageUrl: string) => {
			try {
				const cacheKey = getImageCacheKey(imageUrl);
				const cachedUri = await AsyncStorage.getItem(cacheKey);

				if (cachedUri) {
					const fileInfo = await FileSystem.getInfoAsync(cachedUri);
					if (fileInfo.exists) {
						setCachedImageUri(cachedUri);
						return;
					}
				}

				// If not cached, show original URL immediately and cache in background
				setCachedImageUri(imageUrl);
				const newCachedUri = await cacheImageWithAsyncStorage(imageUrl);
				if (newCachedUri !== imageUrl) {
					setCachedImageUri(newCachedUri);
				}
			} catch (error) {
				console.warn("Failed to preload image:", error);
				setCachedImageUri(imageUrl);
			}
		},
		[cacheImageWithAsyncStorage],
	);

	useEffect(() => {
		if (product?.imageUrl) {
			preloadImage(product.imageUrl);
		} else {
			setCachedImageUri(null);
		}
	}, [product, preloadImage]);

	// Early return if no product is selected
	if (!product) {
		return null;
	}

	const isExpiringSoon = product.daysLeft <= 2;
	const isExpired = product.daysLeft <= 0;

	// Format the expiry date for better readability
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Get the status text and color based on expiry
	const getExpiryStatus = () => {
		if (isExpired) {
			return {
				text: "Expired",
				icon: <AlertCircle size={20} color={"#ef4444"} />,
			};
		} else if (isExpiringSoon) {
			return {
				text:
					product.daysLeft === 1
						? "Expires tomorrow"
						: `Expires in ${product.daysLeft} days`,
				icon: <Clock size={20} color={"#f59e0b"} />,
			};
		} else {
			return {
				text: `Expires in ${product.daysLeft} days`,
				icon: <CalendarClock size={20} color={"#22c55e"} />,
			};
		}
	};

	const expiryStatus = getExpiryStatus();

	return (
		<BottomSheet
			isVisible={!!product}
			onClose={onClose}
			snapPoints={[0.65, 0.85]}
			title={product.name}
			enableBackdropDismiss={true}
		>
			<ScrollView showsVerticalScrollIndicator={false} className="flex-1">
				{/* Product Image Preview */}
				{(cachedImageUri || product.imageUrl) && (
					<View className="mb-2 relative">
						<Image
							source={{ uri: cachedImageUri || product.imageUrl }}
							className="w-full h-48 rounded-xl"
							resizeMode="cover"
							onLoadStart={() => setImageLoading(true)}
							onLoadEnd={() => setImageLoading(false)}
						/>
						{imageLoading && (
							<View className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
								<View className="w-8 h-8 border-2 border-gray-300 border-t-brand-500 rounded-full animate-spin" />
							</View>
						)}
					</View>
				)}

				{/* Category */}
				<View className="flex-row items-center">
					<View className="bg-brand-100 dark:bg-brand-950/50 rounded-full px-3 py-1.5 flex-row items-center">
						<Tag size={14} className="text-brand-500 mr-1.5" />
						<Text className="text-brand-600 dark:text-brand-400 text-sm font-medium">
							{product.category}
						</Text>
					</View>
				</View>

				{/* Expiry Info */}
				<View
					className={`rounded-xl p-4 mt-4 ${
						isExpired
							? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 shadow-sm"
							: isExpiringSoon
								? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 shadow-sm"
								: "bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 shadow-sm"
					}`}
				>
					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center flex-1 gap-2">
							<View className="w-10 h-10 items-center justify-center">
								{expiryStatus.icon}
							</View>
							<View className="ml-3">
								<Text className="text-foreground font-semibold text-base">
									{expiryStatus.text}
								</Text>
								<Text className="text-muted-foreground text-sm">
									Expiry Date: {formatDate(product.expiryDate)}
								</Text>
							</View>
						</View>
						<View className="flex-row gap-2">
							<TouchableOpacity
								onPress={handleMarkAsUsed}
								disabled={isMarkingAsUsed}
								className="p-2 rounded-2xl bg-green-100 dark:bg-green-950/50"
							>
								<CheckCircle size={20} strokeWidth={2.5} color="#22c55e" />
								{isMarkingAsUsed && (
									<View className="absolute inset-0 items-center justify-center">
										<View className="w-4 h-4 border-2 border-green-300 border-t-green-500 rounded-full animate-spin" />
									</View>
								)}
							</TouchableOpacity>
							<TouchableOpacity
								onPress={handleDelete}
								disabled={isDeleting}
								className="p-2 rounded-2xl"
							>
								<Trash2 size={20} strokeWidth={2.5} color="#ef4444" />
								{isDeleting && (
									<View className="absolute inset-0 items-center justify-center">
										<View className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
									</View>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</View>

				{/* Quantity Card */}
				{product.quantity && (
					<View className="bg-card mt-2 rounded-2xl p-5 shadow-sm ">
						<View className="flex-row items-center justify-between">
							<View className="flex-row items-center flex-1 gap-2">
								<View className="w-10 h-10 bg-brand-100 dark:bg-brand-950/50 rounded-full items-center justify-center">
									<Package size={18} className="text-brand-500" />
								</View>
								<View className="ml-3">
									<Text className="text-foreground font-semibold text-base">
										Quantity
									</Text>
									<Text className="text-muted-foreground text-sm">
										Available items
									</Text>
								</View>
							</View>
							<View className="bg-brand-50 dark:bg-brand-950/30 rounded-full px-4 py-2">
								<Text className="text-brand-600 dark:text-brand-400 font-bold text-lg">
									{product.quantity}
								</Text>
							</View>
						</View>
					</View>
				)}

				{/* Notes if available */}
				{product.notes && (
					<View className="bg-card rounded-2xl p-5 mt-2 shadow-sm ">
						<View className="flex-row items-center justify-between">
							<View className="flex-row items-center">
								<View className="w-10 h-10 bg-blue-100 dark:bg-blue-950/50 rounded-full items-center justify-center">
									<Info size={18} className="text-blue-500" />
								</View>
								<Text className="ml-3 text-foreground font-semibold text-base">
									Notes
								</Text>
							</View>
						</View>
						<View className="rounded-xl p-2">
							<Text
								variant="block-quote"
								className="text-muted-foreground text-xs leading-6"
							>
								{product.notes}
							</Text>
						</View>
					</View>
				)}
			</ScrollView>
		</BottomSheet>
	);
};

export default ProductDetails;
