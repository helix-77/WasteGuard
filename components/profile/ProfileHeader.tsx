import { Text, View } from "react-native";
import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Crown, User } from "lucide-react-native";
import { H3, Muted, Small } from "../ui/typography";
import { Badge } from "../ui/badge";

interface ProfileHeaderProps {
	name: string;
	email: string;
	plan?: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, email, plan }) => {
	return (
		<Card className="mx-4 mb-4">
			<CardHeader className="flex-row items-center justify-center">
				{/* Avatar placeholder */}
				<View className="w-24 h-24 rounded-full bg-primary items-center justify-center shadow-lg shadow-green-500/50">
					<User size={40} className="text-white" />
				</View>

				{/* User info */}
				<CardContent>
					<H3 className="text-foreground font-bold mb-1">{name}</H3>
					<Muted className="text-muted-foreground mb-3">{email}</Muted>

					{/* Premium badge */}
					{plan && (
						<Badge
							variant={plan.toLowerCase() === "premium" ? "success" : "warning"}
							className="flex-row items-center justify-center gap-1 w-28 p-1.5"
						>
							<Crown size={12} />
							<Small className="text-black font-medium">{plan}</Small>
						</Badge>
					)}
				</CardContent>
			</CardHeader>
		</Card>
	);
};

export default ProfileHeader;
