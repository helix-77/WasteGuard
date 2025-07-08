import React, { useEffect, useRef, useState, useCallback } from "react";
import {
	View,
	Text,
	Modal,
	Animated,
	Dimensions,
	PanResponder,
	TouchableWithoutFeedback,
	Image,
} from "react-native";
import { AlertCircle, CalendarClock, Clock } from "lucide-react-native";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Package } from "@/lib/icons/Package";
import { Tag } from "@/lib/icons/Tag";
import { Info } from "@/lib/icons/Info";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ProductBottomsheetProps {
	product: ProductItem | null;
	onClose: () => void;
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

const ProductBottomsheet: React.FC<ProductBottomsheetProps> = ({
	product,
	onClose,
}) => {
	const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
	const opacity = useRef(new Animated.Value(0)).current;
	const [cachedImageUri, setCachedImageUri] = useState<string | null>(null);
	const [imageLoading, setImageLoading] = useState(false);

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
							await FileSystem.deleteAsync(cachedUri, { idempotent: true });
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
					await AsyncStorage.setItem(
						metadataKey,
						JSON.stringify({
							timestamp: Date.now(),
							originalUrl: imageUrl,
							size:
								(await FileSystem.getInfoAsync(downloadResult.uri)).size || 0,
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

	const panResponder = PanResponder.create({
		onStartShouldSetPanResponder: () => true,
		onMoveShouldSetPanResponder: (_, gestureState) => {
			return Math.abs(gestureState.dy) > 10;
		},

		onPanResponderMove: (_, gestureState) => {
			if (gestureState.dy > 0) {
				translateY.setValue(gestureState.dy);
			}
		},
		onPanResponderRelease: (_, gestureState) => {
			if (gestureState.dy > 150) {
				hideModal();
			} else {
				Animated.spring(translateY, {
					toValue: 0,
					useNativeDriver: true,
					friction: 8,
					tension: 40,
				}).start();
			}
		},
	});

	const hideModal = () => {
		Animated.parallel([
			Animated.timing(opacity, {
				toValue: 0,
				duration: 250,
				useNativeDriver: true,
			}),
			Animated.timing(translateY, {
				toValue: SCREEN_HEIGHT,
				duration: 250,
				useNativeDriver: true,
			}),
		]).start(() => {
			onClose();
		});
	};

	useEffect(() => {
		const showModal = () => {
			Animated.parallel([
				Animated.timing(opacity, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
				}),
				Animated.spring(translateY, {
					toValue: 0,
					useNativeDriver: true,
					friction: 8,
					tension: 40,
				}),
			]).start();
		};

		if (product) {
			showModal();
			// Preload image for better UX
			if (product.imageUrl) {
				preloadImage(product.imageUrl);
			} else {
				setCachedImageUri(null);
			}
		} else {
			translateY.setValue(SCREEN_HEIGHT);
			opacity.setValue(0);
			setCachedImageUri(null);
		}
	}, [product, translateY, opacity, preloadImage]);

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
		<Modal
			visible={!!product}
			transparent={true}
			animationType="none"
			onRequestClose={hideModal}
			statusBarTranslucent={true}
		>
			<TouchableWithoutFeedback onPress={hideModal}>
				<Animated.View
					style={{
						opacity: opacity,
						flex: 1,
						backgroundColor: "rgba(0, 0, 0, 0.5)",
					}}
				>
					<TouchableWithoutFeedback onPress={() => {}}>
						<Animated.View
							{...panResponder.panHandlers}
							style={{
								position: "absolute",
								bottom: 0,
								left: 0,
								right: 0,
								transform: [{ translateY }],
							}}
							className="bg-background rounded-t-3xl min-h-[60%] max-h-[70%] shadow-xl"
						>
							{/* Drag Handle */}
							<View className="w-10 h-1 bg-muted rounded-full self-center mt-3 mb-2" />

							<View className="p-6">
								{/* Product Image Preview */}
								{(cachedImageUri || product.imageUrl) && (
									<View className="mb-6 relative">
										<Image
											source={{ uri: cachedImageUri || product.imageUrl }}
											className="w-full h-48 rounded-xl"
											resizeMode="cover"
											onLoadStart={() => setImageLoading(true)}
											onLoadEnd={() => setImageLoading(false)}
										/>
										{imageLoading && (
											<View className="absolute inset-0 bg-muted/80 rounded-xl flex items-center justify-center">
												<View className="bg-brand-500 w-4 h-4 rounded-full animate-pulse" />
											</View>
										)}
									</View>
								)}

								{/* Product Title */}
								<Text className="text-2xl font-bold text-foreground mb-1">
									{product.name}
								</Text>

								{/* Category */}
								<View className="mt-1 flex-row items-center mb-6">
									<View className="bg-brand-100 dark:bg-brand-950/50 rounded-full px-3 py-1 flex-row items-center">
										<Tag size={14} className="text-brand-500 mr-1.5" />
										<Text className="text-xs font-medium text-brand-700 dark:text-brand-300">
											{product.category}
										</Text>
									</View>
								</View>

								{/* Expiry Info */}
								<View
									className={`rounded-xl p-4 mb-6 ${
										isExpired
											? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 shadow-sm"
											: isExpiringSoon
												? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 shadow-sm"
												: "bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 shadow-sm"
									}`}
								>
									<View className="flex-row items-center mb-2">
										{expiryStatus.icon}
										<Text
											className={`ml-2 font-medium ${
												isExpired
													? "text-red-600 dark:text-red-400"
													: isExpiringSoon
														? "text-amber-600 dark:text-amber-400"
														: "text-brand-600 dark:text-brand-400"
											}`}
										>
											{expiryStatus.text}
										</Text>
									</View>
									<Text className="text-muted-foreground text-sm">
										Expiry Date: {formatDate(product.expiryDate)}
									</Text>
								</View>

								{/* Quantity if available */}
								{product.quantity && (
									<View className="flex-row items-center mb-4 bg-muted/50 p-3 rounded-lg shadow-sm">
										<Package size={18} className="text-muted-foreground mr-2" />
										<Text className="text-foreground text-sm font-medium">
											Quantity:{" "}
											<Text className="text-muted-foreground font-normal">
												{product.quantity}
											</Text>
										</Text>
									</View>
								)}

								{/* Notes if available */}
								{product.notes && (
									<View className="mt-4 bg-muted/50 rounded-xl p-4 border-l-4 border-brand-500 shadow-sm">
										<View className="flex-row items-center mb-2">
											<Info size={18} className="text-brand-500 mr-2" />
											<Text className="font-medium text-foreground">Notes</Text>
										</View>
										<Text className="text-muted-foreground text-sm leading-relaxed">
											{product.notes}
										</Text>
									</View>
								)}
							</View>
						</Animated.View>
					</TouchableWithoutFeedback>
				</Animated.View>
			</TouchableWithoutFeedback>
		</Modal>
	);
};

export default ProductBottomsheet;
