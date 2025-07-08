import React, { useState, useCallback, useRef } from "react";
import {
	View,
	Pressable,
	Text,
	ScrollView,
	TextInput,
	TouchableOpacity,
	Animated,
	Alert,
	RefreshControl,
} from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import {
	Search,
	X,
	AlertCircle,
	Trash2,
	UserCog,
	RefreshCw,
} from "lucide-react-native";
import {
	Swipeable,
	RectButton,
	GestureHandlerRootView,
} from "react-native-gesture-handler";
import ProductBottomsheet from "@/components/ProductBottomsheet";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useProducts } from "@/lib/hooks/useProducts";
import { ProductItem } from "@/lib/services/productService";

/**
 * List of available product categories (user can create new categories while adding products)
 */
const defaultCategories = [
	"All",
	"Cosmetics",
	"Dairy",
	"Bakery",
	"Vegetables",
	"Fruits",
	"Meat",
	"Seafood",
];

export default function Product() {
	const [showSearch, setShowSearch] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [refreshing, setRefreshing] = useState(false);
	const flashListRef = useRef<FlashList<ProductItem>>(null);

	const {
		products,
		categories,
		loading,
		error,
		deleteProduct,
		refreshProducts,
	} = useProducts();

	const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
		null,
	);

	// Keep track of open swipeable items to close them when another is opened
	const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

	// Function to delete a product
	const handleDelete = useCallback(
		async (productId: string) => {
			try {
				await deleteProduct(productId);
			} catch (error) {
				console.error("Failed to delete product:", error);
				Alert.alert("Error", "Failed to delete product. Please try again.");
			}
		},
		[deleteProduct],
	);

	// Function to handle product selection and open bottom sheet
	const handleProductSelect = useCallback((product: ProductItem) => {
		setSelectedProduct(product);
	}, []);

	// Function to close bottom sheet
	const handleCloseBottomSheet = useCallback(() => {
		setSelectedProduct(null);
	}, []);

	// Handle pull to refresh
	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await refreshProducts();
		} catch (error) {
			console.error("Failed to refresh products:", error);
		} finally {
			setRefreshing(false);
		}
	}, [refreshProducts]);

	// Combine default categories with user categories
	const allCategories = [
		...defaultCategories,
		...categories.filter((cat) => !defaultCategories.includes(cat)),
	];

	// Filter products based on search query and selected category
	const filteredProducts = products.filter((product) => {
		const matchesSearch =
			product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			product.category.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesCategory =
			selectedCategory === "All" || product.category === selectedCategory;

		return matchesSearch && matchesCategory;
	});

	/**
	 * Renders the right actions (delete button) for the swipeable
	 */
	const renderRightActions = useCallback(
		(
			progress: Animated.AnimatedInterpolation<number>,
			_dragX: Animated.AnimatedInterpolation<number>,
			item: ProductItem,
		) => {
			const trans = progress.interpolate({
				inputRange: [0, 1],
				outputRange: [64, 0],
				extrapolate: "clamp",
			});

			return (
				<Animated.View
					style={{
						width: 74,
						height: "90%",
						transform: [{ translateX: trans }],
					}}
				>
					<RectButton
						style={{
							flex: 1,
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: "#ef4444",
							borderTopRightRadius: 16,
							borderBottomRightRadius: 16,
						}}
						onPress={() => handleDelete(item.id)}
					>
						<Trash2 size={24} color="#ffffff" />
					</RectButton>
				</Animated.View>
			);
		},
		[handleDelete],
	);

	/**
	 * Renders a single product item
	 */
	const renderProductItem = useCallback(
		({ item }: { item: ProductItem }) => {
			const isExpiringSoon = item.daysLeft <= 2;
			const isExpired = item.daysLeft <= 0;

			// Store reference to close other swipeables when a new one is opened
			const closeOtherSwipeables = (id: string) => {
				swipeableRefs.current.forEach((ref, key) => {
					if (key !== id && ref) {
						ref.close();
					}
				});
			};

			return (
				<Swipeable
					ref={(ref) => {
						if (ref) {
							swipeableRefs.current.set(item.id, ref);
						} else {
							swipeableRefs.current.delete(item.id);
						}
					}}
					friction={2}
					rightThreshold={40}
					renderRightActions={(progress, dragX) =>
						renderRightActions(progress, dragX, item)
					}
					onSwipeableOpen={() => closeOtherSwipeables(item.id)}
				>
					<TouchableOpacity
						className="bg-card rounded-2xl p-4 mb-3 shadow-sm"
						onPress={() => handleProductSelect(item)}
					>
						<View className="flex-row justify-between items-center">
							<View className="flex-1">
								<Text className="text-lg font-semibold text-foreground">
									{item.name}
								</Text>
								<Text className="text-sm text-muted-foreground mt-1">
									{item.category}
								</Text>
							</View>

							<View>
								<View className="flex-row items-center">
									{isExpired && (
										<AlertCircle size={16} color="#ef4444" className="mr-1" />
									)}
									<Text
										className={`text-sm font-medium ${
											isExpired
												? "text-red-500"
												: isExpiringSoon
													? "text-amber-500"
													: "text-green-500"
										}`}
									>
										{isExpired
											? "Expired"
											: item.daysLeft === 1
												? "1 day left"
												: `${item.daysLeft} days left`}
									</Text>
								</View>
								{item.quantity && (
									<Text className="text-xs text-muted-foreground text-right mt-1">
										Qty: {item.quantity}
									</Text>
								)}
							</View>
						</View>

						{item.notes && (
							<Text className="text-xs text-muted-foreground mt-2 italic">
								Note: {item.notes}
							</Text>
						)}
					</TouchableOpacity>
				</Swipeable>
			);
		},
		[handleProductSelect, renderRightActions],
	);

	return (
		<SafeAreaView className="flex-1 bg-background">
			<GestureHandlerRootView style={{ flex: 1 }}>
				<View className="flex-1 px-4 py-2">
					{/* Header with search toggle */}
					<View className="flex-row justify-between items-center mb-6">
						<Text className="text-2xl font-bold text-foreground text-center">
							Products
						</Text>
						<View className="flex-row items-center gap-x-2">
							<TouchableOpacity
								onPress={() => setShowSearch(!showSearch)}
								className="p-2 rounded-full"
							>
								<Search size={20} strokeWidth={3.5} color="#6b7280" />
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => router.push("../profile")}
								className="p-2 rounded-full"
							>
								<UserCog size={20} strokeWidth={3} color="#6b7280" />
							</TouchableOpacity>
						</View>
					</View>

					{/* Search bar */}
					{showSearch && (
						<View className="flex-row items-center mb-4 relative">
							<TextInput
								className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-xl flex-1 text-foreground"
								placeholder="Search products..."
								placeholderTextColor="#9ca3af"
								value={searchQuery}
								onChangeText={setSearchQuery}
								autoFocus
							/>
							{searchQuery.length > 0 && (
								<Pressable
									className="absolute right-3"
									onPress={() => setSearchQuery("")}
								>
									<X size={20} color="#9ca3af" />
								</Pressable>
							)}
						</View>
					)}

					{/* Categories */}
					<View>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							className="mb-4"
							contentContainerStyle={{ paddingHorizontal: 4 }}
						>
							{allCategories.map((category: string) => (
								<Pressable
									key={category}
									onPress={() => setSelectedCategory(category)}
									className={`mr-2 px-4 py-2 rounded-full ${
										selectedCategory === category
											? "bg-green-600"
											: "bg-gray-100 dark:bg-secondary"
									}`}
								>
									<Text
										className={`font-medium ${
											selectedCategory === category
												? "text-white"
												: "text-foreground"
										}`}
									>
										{category}
									</Text>
								</Pressable>
							))}
						</ScrollView>
					</View>

					{/* Products section */}
					<View style={{ flex: 1 }}>
						<View className="flex-row justify-between items-center mb-3">
							<Text className="text-lg font-semibold text-muted-foreground">
								Items ({filteredProducts.length})
							</Text>
							{loading && (
								<TouchableOpacity onPress={refreshProducts}>
									<RefreshCw size={16} color="#6b7280" />
								</TouchableOpacity>
							)}
						</View>

						{error && (
							<View className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-3">
								<Text className="text-red-600 dark:text-red-400 text-sm">
									{error}
								</Text>
								<TouchableOpacity onPress={refreshProducts} className="mt-2">
									<Text className="text-red-600 dark:text-red-400 text-sm font-medium">
										Tap to retry
									</Text>
								</TouchableOpacity>
							</View>
						)}

						{loading ? (
							<View className="items-center justify-center py-12">
								<RefreshCw size={32} color="#6b7280" className="animate-spin" />
								<Text className="text-muted-foreground mt-4">
									Loading products...
								</Text>
							</View>
						) : filteredProducts.length === 0 ? (
							<View className="items-center justify-center py-12">
								<AlertCircle size={48} color="#9ca3af" />
								<Text className="text-muted-foreground mt-4 text-center">
									{searchQuery || selectedCategory !== "All"
										? "No products found matching your filters."
										: "No products yet. Add your first product!"}
								</Text>
							</View>
						) : (
							<FlashList
								ref={flashListRef}
								data={filteredProducts}
								renderItem={renderProductItem}
								keyExtractor={(item) => item.id}
								showsVerticalScrollIndicator={false}
								contentContainerStyle={{ paddingBottom: 20 }}
								estimatedItemSize={100}
								refreshControl={
									<RefreshControl
										refreshing={refreshing}
										onRefresh={handleRefresh}
										colors={["#22c55e"]} // Android
										tintColor="#22c55e" // iOS
									/>
								}
							/>
						)}
					</View>
				</View>

				{/* Product bottom sheet */}
				<ProductBottomsheet
					product={selectedProduct}
					onClose={handleCloseBottomSheet}
				/>
			</GestureHandlerRootView>
		</SafeAreaView>
	);
}
