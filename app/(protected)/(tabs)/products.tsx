import React, { useState, useCallback, useRef } from "react";
import {
	View,
	Pressable,
	Text,
	ScrollView,
	TextInput,
	TouchableOpacity,
	Animated,
	FlatList,
	ListRenderItem,
} from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { FlashList } from "@shopify/flash-list";
import { Search, X, AlertCircle, Trash2 } from "lucide-react-native";
import {
	Swipeable,
	RectButton,
	GestureHandlerRootView,
} from "react-native-gesture-handler";
import ProductBottomsheet from "@/components/ProductBottomsheet";

/**
 * Interface representing a product item
 */
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

/**
 * Sample product data for demonstration
 */
const productList: ProductItem[] = [
	{
		id: "1",
		name: "Organic Spinach",
		category: "Vegetables",
		expiryDate: "2025-07-02",
		daysLeft: 3,
		notes: "Fresh from local farm",
		quantity: 1,
	},
	{
		id: "2",
		name: "Greek Yogurt",
		category: "Dairy",
		expiryDate: "2025-07-01",
		daysLeft: 2,
		quantity: 2,
		notes:
			"Low fat, plain. Perfect for smoothies. Store in fridge. Consume within 5 days after opening.",
	},
	{
		id: "3",
		name: "Sourdough Bread",
		category: "Bakery",
		expiryDate: "2025-06-30",
		daysLeft: 1,
		quantity: 1,
	},
	{
		id: "4",
		name: "Avocados",
		category: "Fruits",
		expiryDate: "2025-07-05",
		daysLeft: 6,
		quantity: 3,
	},
	{
		id: "5",
		name: "Fresh Salmon",
		category: "Seafood",
		expiryDate: "2025-06-29",
		daysLeft: 0,
		notes: "Wild caught",
		quantity: 1,
	},
	{
		id: "6",
		name: "Bell Peppers",
		category: "Vegetables",
		expiryDate: "2025-06-30",
		daysLeft: 1,
		quantity: 4,
	},
	{
		id: "7",
		name: "Cream Cheese",
		category: "Dairy",
		expiryDate: "2025-07-01",
		daysLeft: 2,
		quantity: 1,
	},
	{
		id: "8",
		name: "Strawberries",
		category: "Fruits",
		expiryDate: "2025-07-01",
		daysLeft: 2,
		quantity: 1,
		notes: "Organic",
	},
	{
		id: "9",
		name: "Chicken Breast",
		category: "Meat",
		expiryDate: "2025-06-29",
		daysLeft: 0,
		quantity: 2,
	},
	{
		id: "10",
		name: "Milk",
		category: "Dairy",
		expiryDate: "2025-07-02",
		daysLeft: 3,
		quantity: 1,
	},
];

/**
 * List of available product categories (user can create new categories while adding products)
 */
const catagorieList = [
	"All",
	"Cosmetics",
	"Dairy",
	"Bakery",
	"Vegetables",
	"Fruits",
	"Meat",
	"Seafood",
];

/**
 * Product component that renders the list of all products with search and filtering
 */
export default function Product() {
	const [showSearch, setShowSearch] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");

	const [products, setProducts] = useState<ProductItem[]>(productList);

	// State for bottom sheet
	const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
		null,
	);

	// Keep track of open swipeable items to close them when another is opened
	const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

	// Function to delete a product
	const handleDelete = useCallback((productId: string) => {
		setProducts((currentProducts) =>
			currentProducts.filter((product) => product.id !== productId),
		);
	}, []);

	// Function to handle product selection and open bottom sheet
	const handleProductSelect = useCallback((product: ProductItem) => {
		setSelectedProduct(product);
	}, []);

	// Function to close bottom sheet
	const handleCloseBottomSheet = useCallback(() => {
		setSelectedProduct(null);
	}, []);

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
	const renderProductItem: ListRenderItem<ProductItem> = useCallback(
		({ item }) => {
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
						<View style={{ width: 20 }}>
							<Text>{/* Spacer for balance */}</Text>
						</View>
						<Text className="text-2xl font-bold text-foreground text-center">
							Products
						</Text>
						<TouchableOpacity
							onPress={() => setShowSearch(!showSearch)}
							className="p-2 rounded-full"
						>
							<Search size={20} strokeWidth={3.5} color="#6b7280" />
						</TouchableOpacity>
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
							{catagorieList.map((category) => (
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
						<Text className="text-lg font-semibold text-muted-foreground mb-3">
							Items ({filteredProducts.length})
						</Text>

						{filteredProducts.length === 0 ? (
							<View className="items-center justify-center py-12">
								<AlertCircle size={48} color="#9ca3af" />
								<Text className="text-muted-foreground mt-4 text-center">
									No products found matching your filters.
								</Text>
							</View>
						) : (
							<FlatList
								data={filteredProducts}
								renderItem={renderProductItem}
								keyExtractor={(item) => item.id}
								showsVerticalScrollIndicator={false}
								contentContainerStyle={{ paddingBottom: 20 }}
								removeClippedSubviews={true}
								maxToRenderPerBatch={10}
								windowSize={10}
								initialNumToRender={8}
								updateCellsBatchingPeriod={100}
								onEndReachedThreshold={0.1}
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
