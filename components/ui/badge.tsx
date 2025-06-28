import * as React from "react";
import { View } from "react-native";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.ComponentPropsWithoutRef<typeof View> {
	variant?:
		| "default"
		| "secondary"
		| "destructive"
		| "outline"
		| "success"
		| "warning";
}

const badgeVariants = {
	default: "bg-primary",
	secondary: "bg-secondary",
	destructive: "bg-destructive",
	outline: "border border-input bg-background",
	success: "bg-green-500",
	warning: "bg-yellow-500",
};

const Badge = React.forwardRef<React.ElementRef<typeof View>, BadgeProps>(
	({ className, variant = "default", ...props }, ref) => (
		<View
			ref={ref}
			className={cn(
				"inline-flex items-center rounded-full px-2.5 py-0.5",
				badgeVariants[variant],
				className,
			)}
			{...props}
		/>
	),
);
Badge.displayName = "Badge";

export { Badge, type BadgeProps };
