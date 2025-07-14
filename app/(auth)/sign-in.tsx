import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
	ActivityIndicator,
	View,
	TouchableOpacity,
	Alert,
	Animated,
	KeyboardAvoidingView,
	Platform,
	Image,
} from "react-native";
import * as z from "zod";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/supabase-provider";
import { Facebook, LogOut } from "lucide-react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

const formSchema = z.object({
	email: z.string().email("Please enter a valid email address."),
	password: z
		.string()
		.min(8, "Please enter at least 8 characters.")
		.max(64, "Please enter fewer than 64 characters."),
});

export default function SignIn() {
	const { signIn } = useAuth();
	const [fadeAnim] = useState(new Animated.Value(0));
	const [slideAnim] = useState(new Animated.Value(30));
	const [passwordVisible, setPasswordVisible] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	useEffect(() => {
		// Start animations when component mounts
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 800,
				useNativeDriver: true,
			}),
			Animated.timing(slideAnim, {
				toValue: 0,
				duration: 800,
				useNativeDriver: true,
			}),
		]).start();
	}, [fadeAnim, slideAnim]);

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			await signIn(data.email, data.password);
			form.reset();
			router.replace("/home");
		} catch (error: Error | any) {
			console.error(error.message);
			Alert.alert("Error", "Failed to sign in. Please check your credentials.");
		}
	}

	const togglePasswordVisibility = () => {
		setPasswordVisible(!passwordVisible);
	};

	return (
		<SafeAreaView className="flex-1 bg-background" edges={["top"]}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1"
				keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
			>
				<Animated.ScrollView
					contentContainerStyle={{ flexGrow: 1 }}
					className="px-6"
					showsVerticalScrollIndicator={false}
					style={{
						opacity: fadeAnim,
						transform: [{ translateY: slideAnim }],
					}}
				>
					<View className="flex-1 justify-between py-8">
						<View className="items-center my-8">
							<Image
								source={require("@/assets/icon.png")}
								className="w-24 h-24 rounded-2xl mb-4"
							/>
							<Text className="text-3xl font-bold text-center text-primary">
								Welcome Back!
							</Text>
							<Text className="text-muted-foreground text-center mt-2">
								Sign in to continue to WasteGuard
							</Text>
						</View>

						<View className="rounded-3xl mb-8">
							<Form {...form}>
								<View className="gap-4 mb-4">
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormInput
												label="Email"
												placeholder="your.email@example.com"
												autoCapitalize="none"
												autoComplete="email"
												autoCorrect={false}
												keyboardType="email-address"
												className="rounded-2xl px-4 py-4 placeholder:text-muted-foreground/50"
												{...field}
											/>
										)}
									/>
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<View className="relative">
												<FormInput
													label="Password"
													placeholder="••••••••"
													autoCapitalize="none"
													autoCorrect={false}
													secureTextEntry={!passwordVisible}
													className="rounded-2xl px-4 py-4 pr-12 placeholder:text-muted-foreground/50"
													{...field}
												/>
												<TouchableOpacity
													onPress={togglePasswordVisibility}
													className="absolute right-4 top-11"
												>
													<Ionicons
														name={passwordVisible ? "eye-off" : "eye"}
														size={20}
														color="#666"
													/>
												</TouchableOpacity>
											</View>
										)}
									/>
								</View>
							</Form>

							<TouchableOpacity className="mb-6">
								<Text className="text-primary text-right text-sm">
									Forgot Password?
								</Text>
							</TouchableOpacity>

							<Button
								// size="lg"
								variant={"glow"}
								onPress={form.handleSubmit(onSubmit)}
								disabled={form.formState.isSubmitting}
								className="rounded-2xl mb-6 "
							>
								{form.formState.isSubmitting ? (
									<ActivityIndicator size="small" color="white" />
								) : (
									<Text className="text-black font-semibold text-base">
										Sign In
									</Text>
								)}
							</Button>

							<View className="flex-row items-center justify-center mt-3 mb-9">
								<View className="h-[1px] bg-gray-300 flex-1" />
								<Text className="text-muted-foreground mx-4">
									Or continue with
								</Text>
								<View className="h-[1px] bg-gray-300 flex-1" />
							</View>

							{/* OAuth */}
							<View className="flex-row gap-4 mb-6 justify-center">
								<View className="flex-row gap-4 mb-6 justify-center">
									<TouchableOpacity className="border border-muted px-5 flex-row items-center justify-center p-3 rounded-2xl">
										<AntDesign name="google" size={20} color="#DB4437" />
										<Text className="ml-2 font-medium">Google</Text>
									</TouchableOpacity>

									<TouchableOpacity className="border border-muted px-5 flex-row items-center justify-center p-3 rounded-2xl">
										<AntDesign name="apple1" size={20} color="#62748e" />
										<Text className="ml-2 font-medium">Apple</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>

						<View className="flex-row justify-center mb-4">
							<Text className="text-muted-foreground">
								Don&apos;t have an account?{" "}
							</Text>
							<Link href="/sign-up" asChild>
								<TouchableOpacity>
									<Text className="text-primary font-semibold">Sign Up</Text>
								</TouchableOpacity>
							</Link>
						</View>
					</View>
				</Animated.ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
