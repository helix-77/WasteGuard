import { TouchableOpacity, View } from "react-native";
import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { ChevronLeft, Crown, User } from "lucide-react-native";
import { H1, H2, H3, H4, Muted, Small } from "../ui/typography";
import { Badge } from "../ui/badge";
import { ThemeToggle } from "../ui/ThemeToggle";
import { router } from "expo-router";

interface ProfileHeaderProps {
	name: string;
	email: string;
	plan?: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = React.memo(
	({ name, email, plan }) => {
		return (
			<View className="px-4 mb-6 ">
				{/* Header with back button and theme toggle */}
				<View className="flex-row items-center justify-between ">
					<TouchableOpacity
						onPress={() => router.back()}
						className="p-2 -ml-2"
						activeOpacity={0.7}
					>
						<ChevronLeft
							strokeWidth={2.5}
							size={24}
							className="text-foreground"
						/>
					</TouchableOpacity>

					{/* <H3>Settings</H3> */}

					<View className="p-1">
						<ThemeToggle />
					</View>
				</View>

				<Card className="shadow-sm">
					<CardContent className="items-center pb-6 ">
						{/* Avatar placeholder */}
						<View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-4 shadow-lg shadow-primary/30">
							<User size={32} className="text-white" />
						</View>

						{/* User info */}
						<View className="items-center">
							<H3 className="text-foreground font-bold mb-1 text-center">
								{name}
							</H3>
							<Muted className="text-muted-foreground mb-3 text-center">
								{email}
							</Muted>

							{/* Premium badge */}
							{plan && (
								<Badge
									variant={
										plan.toLowerCase() === "premium" ? "success" : "warning"
									}
									className="flex-row items-center justify-center gap-1 px-3 py-1.5"
								>
									<Crown size={12} />
									<Small className="text-black font-medium">{plan}</Small>
								</Badge>
							)}
						</View>
					</CardContent>
				</Card>
			</View>
		);
	},
);

ProfileHeader.displayName = "ProfileHeader";

export default ProfileHeader;
