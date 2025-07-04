import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

import { useState } from "react";

export default function Profile() {
	const { signOut } = useAuth();
	return (
		<View className="flex-1 items-center justify-center bg-background p-4 gap-y-4">
			<H1 className="text-center">Sign Out</H1>
			<Muted className="text-center">
				Sign out and return to the welcome screen.
			</Muted>
			<View className="w-full h-0.5 bg-border my-4">
				<ThemeToggle />
			</View>
			<Button
				className="w-full"
				size="default"
				variant="default"
				onPress={async () => {
					await signOut();
				}}
			>
				<Text>Sign Out</Text>
			</Button>
		</View>
	);
}
