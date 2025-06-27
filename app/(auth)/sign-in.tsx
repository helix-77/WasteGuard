import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ActivityIndicator, View, TouchableOpacity, Alert } from "react-native";
import * as z from "zod";
import { Link, router } from "expo-router";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";

const formSchema = z.object({
	email: z.string().email("Please enter a valid email address."),
	password: z
		.string()
		.min(8, "Please enter at least 8 characters.")
		.max(64, "Please enter fewer than 64 characters."),
});

export default function SignIn() {
	const { signIn } = useAuth();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			await signIn(data.email, data.password);
			form.reset();
		} catch (error: Error | any) {
			console.error(error.message);
		}
		router.replace("../Home");
	}

	return (
		<SafeAreaView className="flex-1 bg-background p-6" edges={["bottom"]}>
			<View className="flex-1 justify-center">
				<View className="rounded-3xl p-4 shadow-lg">
					<Text className="text-2xl font-bold mb-8 text-center">
						Welcome Back!
					</Text>

					<Form {...form}>
						<View className="gap-4 mb-4">
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
										className="rounded-xl px-4 py-3"
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
						</View>
					</Form>

					<TouchableOpacity className="mb-6">
						<Text className="text-gray-500 text-right text-sm">
							Forgot Password?
						</Text>
					</TouchableOpacity>

					<Button
						size="default"
						onPress={form.handleSubmit(onSubmit)}
						disabled={form.formState.isSubmitting}
						className="rounded-xl py-4 mb-6"
					>
						{form.formState.isSubmitting ? (
							<ActivityIndicator size="small" color="white" />
						) : (
							<Text className="text-white font-semibold">Log In</Text>
						)}
					</Button>

					<View className="items-center mb-6">
						<Text className="text-gray-500 text-sm">Or log in</Text>
					</View>

					<View className="gap-3 mb-6">
						<Button
							variant="secondary"
							className="border-red-600 rounded-xl py-4 flex-row items-center justify-center"
						>
							<Text className="text-red-600 font-semibold ml-2">
								LOGIN WITH GOOGLE
							</Text>
						</Button>

						<Button
							variant="secondary"
							className="border-blue-600 rounded-xl py-4 flex-row items-center justify-center"
						>
							<Text className="text-blue-600 font-semibold ml-2">
								LOGIN WITH FACEBOOK
							</Text>
						</Button>
					</View>

					<View className="flex-row justify-center">
						<Text className="text-gray-500 text-sm">Don't have account? </Text>
						<Link href="/sign-up" asChild>
							<TouchableOpacity>
								<Text className="text-primary font-semibold text-sm">
									Sign Up
								</Text>
							</TouchableOpacity>
						</Link>
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
}
