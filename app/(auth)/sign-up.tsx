import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ActivityIndicator, View, TouchableOpacity, Alert } from "react-native";
import * as z from "zod";
import { Link, router } from "expo-router";

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

	return (
		<SafeAreaView className="flex-1 bg-background p-6" edges={["bottom"]}>
			<View className="flex-1 justify-center">
				<View className="rounded-3xl p-4 shadow-lg">
					<Text className="text-2xl font-bold text-foreground mb-8 text-center">
						Let's Get start!
					</Text>

					<Form {...form}>
						<View className="gap-4 mb-6">
							<FormField
								control={form.control}
								name="fullName"
								render={({ field }) => (
									<FormInput
										label="Full Name"
										placeholder="Full Name"
										autoCapitalize="words"
										autoComplete="name"
										autoCorrect={false}
										className=" rounded-xl px-4 py-3"
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
										placeholder="Email"
										autoCapitalize="none"
										autoComplete="email"
										autoCorrect={false}
										keyboardType="email-address"
										className=" rounded-xl px-4 py-3"
										{...field}
									/>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormInput
										label="Password"
										placeholder="Password"
										autoCapitalize="none"
										autoCorrect={false}
										secureTextEntry
										className="rounded-xl px-4 py-3"
										{...field}
									/>
								)}
							/>
							<FormField
								control={form.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormInput
										label="Confirm Password"
										placeholder="Confirm Password"
										autoCapitalize="none"
										autoCorrect={false}
										secureTextEntry
										className="rounded-xl px-4 py-3"
										{...field}
									/>
								)}
							/>
						</View>
					</Form>

					<Button
						size="default"
						onPress={form.handleSubmit(onSubmit)}
						disabled={form.formState.isSubmitting}
						className="rounded-xl py-4 mb-6"
					>
						{form.formState.isSubmitting ? (
							<ActivityIndicator size="small" color="white" />
						) : (
							<Text className="font-semibold">Sign Up</Text>
						)}
					</Button>

					<View className="items-center mb-6">
						<Text className="text-gray-500 text-sm">Or</Text>
					</View>

					<View className="gap-3 mb-6">
						<Button
							variant="secondary"
							className="border-red-600 rounded-xl py-4 flex-row items-center justify-center"
						>
							<Text className="text-red-600 font-semibold ml-2">
								SIGNUP WITH GOOGLE
							</Text>
						</Button>

						<Button
							variant="secondary"
							className="border-blue-600 rounded-xl py-4 flex-row items-center justify-center"
						>
							<Text className="text-blue-600 font-semibold ml-2">
								SIGNUP WITH FACEBOOK
							</Text>
						</Button>
					</View>

					<View className="flex-row justify-center">
						<Text className="text-gray-500 text-sm">
							Already have account?{" "}
						</Text>
						<Link href="/sign-in" asChild>
							<TouchableOpacity>
								<Text className="text-primary font-semibold text-sm">
									Log In
								</Text>
							</TouchableOpacity>
						</Link>
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
}
