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
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/supabase-provider";

const formSchema = z
	.object({
		fullName: z.string().min(2, "Please enter your full name."),
		email: z.string().email("Please enter a valid email address."),
		password: z
			.string()
			.min(8, "Please enter at least 8 characters.")
			.max(64, "Please enter fewer than 64 characters.")
			.regex(
				/^(?=.*[a-z])/,
				"Your password must have at least one lowercase letter.",
			)
			.regex(
				/^(?=.*[A-Z])/,
				"Your password must have at least one uppercase letter.",
			)
			.regex(/^(?=.*[0-9])/, "Your password must have at least one number.")
			.regex(
				/^(?=.*[!@#$%^&*])/,
				"Your password must have at least one special character.",
			),
		confirmPassword: z.string().min(8, "Please enter at least 8 characters."),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Your passwords do not match.",
		path: ["confirmPassword"],
	});

export default function SignUp() {
	const { signUp } = useAuth();
	const [fadeAnim] = useState(new Animated.Value(0));
	const [slideAnim] = useState(new Animated.Value(30));
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

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

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			fullName: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			await signUp(data.email, data.password);
			form.reset();
		} catch (error: Error | any) {
			console.error(error.message);
			Alert.alert("Error", "Failed to sign up. Please try again.");
			return;
		}
		Alert.alert("Success", "Please check your inbox for email verification!", [
			{
				text: "OK",
				onPress: () => {
					router.replace("/sign-in");
				},
			},
		]);
	}

	const togglePasswordVisibility = () => {
		setPasswordVisible(!passwordVisible);
	};

	const toggleConfirmPasswordVisibility = () => {
		setConfirmPasswordVisible(!confirmPasswordVisible);
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
					<View className="py-8">
						<View className="items-center mb-8">
							<Image
								source={require("@/assets/icon.png")}
								className="w-24 h-24 rounded-2xl mb-4"
							/>
							<Text className="text-3xl font-bold text-center text-primary">
								Create Account
							</Text>
							<Text className="text-muted-foreground text-center mt-2">
								Join WasteGuard to reduce waste and save resources
							</Text>
						</View>

						<View className="rounded-3xl mb-6">
							<Form {...form}>
								<View className="gap-4 mb-4">
									<FormField
										control={form.control}
										name="fullName"
										render={({ field }) => (
											<FormInput
												label="Full Name"
												placeholder="Your Name"
												autoCapitalize="words"
												autoComplete="name"
												autoCorrect={false}
												className="placeholder:text-muted-foreground/50"
												{...field}
											/>
										)}
									/>
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
												className="placeholder:text-muted-foreground/50"
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
									<FormField
										control={form.control}
										name="confirmPassword"
										render={({ field }) => (
											<View className="relative">
												<FormInput
													label="Confirm Password"
													placeholder="••••••••"
													autoCapitalize="none"
													autoCorrect={false}
													secureTextEntry={!confirmPasswordVisible}
													className="rounded-2xl px-4 py-4 pr-12 placeholder:text-muted-foreground/50"
													{...field}
												/>
												<TouchableOpacity
													onPress={toggleConfirmPasswordVisibility}
													className="absolute right-4 top-11"
												>
													<Ionicons
														name={confirmPasswordVisible ? "eye-off" : "eye"}
														size={20}
														color="#666"
													/>
												</TouchableOpacity>
											</View>
										)}
									/>
								</View>
							</Form>

							<Button
								size="lg"
								onPress={form.handleSubmit(onSubmit)}
								disabled={form.formState.isSubmitting}
								className="rounded-2xl py-4 mb-6 shadow-md shadow-primary/20"
							>
								{form.formState.isSubmitting ? (
									<ActivityIndicator size="small" color="white" />
								) : (
									<Text className="text-white font-semibold text-base">
										Create Account
									</Text>
								)}
							</Button>

							<View className="flex-row items-center justify-center mb-6">
								<View className="h-[1px] bg-gray-300 flex-1" />
								<Text className="text-muted-foreground mx-4">
									Or sign up with
								</Text>
								<View className="h-[1px] bg-gray-300 flex-1" />
							</View>

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

						<View className="flex-row justify-center mb-4">
							<Text className="text-muted-foreground">
								Already have an account?{" "}
							</Text>
							<Link href="/sign-in" asChild>
								<TouchableOpacity>
									<Text className="text-primary font-semibold">Sign In</Text>
								</TouchableOpacity>
							</Link>
						</View>
					</View>
				</Animated.ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
