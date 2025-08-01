import * as React from "react";
import {
	Controller,
	ControllerProps,
	FieldPath,
	FieldValues,
	FormProvider,
	Noop,
	useFormContext,
} from "react-hook-form";
import { View } from "react-native";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Text } from "./text";

const Form = FormProvider;

type FormFieldContextValue<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
	name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
	{} as FormFieldContextValue,
);

const FormField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	...props
}: ControllerProps<TFieldValues, TName>) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller {...props} />
		</FormFieldContext.Provider>
	);
};

const useFormField = () => {
	const fieldContext = React.useContext(FormFieldContext);
	const itemContext = React.useContext(FormItemContext);
	const { getFieldState, formState, handleSubmit } = useFormContext();

	const fieldState = getFieldState(fieldContext.name, formState);

	if (!fieldContext) {
		throw new Error("useFormField should be used within <FormField>");
	}

	const { nativeID } = itemContext;

	return {
		nativeID,
		name: fieldContext.name,
		formItemNativeID: `${nativeID}-form-item`,
		formDescriptionNativeID: `${nativeID}-form-item-description`,
		formMessageNativeID: `${nativeID}-form-item-message`,
		handleSubmit,
		...fieldState,
	};
};

type FormItemContextValue = {
	nativeID: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
	{} as FormItemContextValue,
);

const FormItem = React.forwardRef<
	React.ComponentRef<typeof View>,
	React.ComponentPropsWithoutRef<typeof View>
>(({ className, ...props }, ref) => {
	const nativeID = React.useId();

	return (
		<FormItemContext.Provider value={{ nativeID }}>
			<View ref={ref} className={cn("space-y-2", className)} {...props} />
		</FormItemContext.Provider>
	);
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
	React.ComponentRef<typeof Label>,
	Omit<React.ComponentPropsWithoutRef<typeof Label>, "children"> & {
		children: string;
	}
>(({ className, nativeID: _nativeID, ...props }, ref) => {
	const { error, formItemNativeID } = useFormField();

	return (
		<Label
			ref={ref}
			className={cn(
				"pb-1 native:pb-2 px-px",
				error && "text-destructive",
				className,
			)}
			nativeID={formItemNativeID}
			{...props}
		/>
	);
});
FormLabel.displayName = "FormLabel";

const FormDescription = React.forwardRef<
	React.ComponentRef<typeof Text>,
	React.ComponentPropsWithoutRef<typeof Text>
>(({ className, ...props }, ref) => {
	const { formDescriptionNativeID } = useFormField();

	return (
		<Text
			ref={ref}
			nativeID={formDescriptionNativeID}
			className={cn("text-xs text-muted-foreground pt-1 px-1", className)}
			{...props}
		/>
	);
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
	React.ComponentRef<typeof Animated.Text>,
	React.ComponentPropsWithoutRef<typeof Animated.Text>
>(({ className, children, ...props }, ref) => {
	const { error, formMessageNativeID } = useFormField();
	const body = error ? String(error?.message) : children;

	if (!body) {
		return null;
	}

	return (
		<Animated.Text
			entering={FadeInDown.duration(300).springify()}
			exiting={FadeOut.duration(200)}
			ref={ref}
			nativeID={formMessageNativeID}
			className={cn(
				"text-xs font-medium text-destructive mt-1 px-1",
				className,
			)}
			{...props}
		>
			{body}
		</Animated.Text>
	);
});
FormMessage.displayName = "FormMessage";

type Override<T, U> = Omit<T, keyof U> & U;

interface FormFieldFieldProps<T> {
	name: string;
	onBlur: Noop;
	onChange: (val: T) => void;
	value: T;
	disabled?: boolean;
}

type FormItemProps<T extends React.ElementType<any>, U> = Override<
	React.ComponentPropsWithoutRef<T>,
	FormFieldFieldProps<U>
> & {
	label?: string;
	description?: string;
};

const FormInput = React.forwardRef<
	React.ComponentRef<typeof Input>,
	FormItemProps<typeof Input, string>
>(({ label, description, onChange, ...props }, ref) => {
	const inputRef = React.useRef<React.ComponentRef<typeof Input>>(null);
	const {
		error,
		formItemNativeID,
		formDescriptionNativeID,
		formMessageNativeID,
	} = useFormField();

	React.useImperativeHandle(ref, () => {
		if (!inputRef.current) {
			return {} as React.ComponentRef<typeof Input>;
		}
		return inputRef.current;
	}, []); // Fixed dependency array

	function handleOnLabelPress() {
		if (!inputRef.current) {
			return;
		}
		if (inputRef.current.isFocused()) {
			inputRef.current?.blur();
		} else {
			inputRef.current?.focus();
		}
	}

	return (
		<FormItem>
			{!!label && (
				<FormLabel
					nativeID={formItemNativeID}
					onPress={handleOnLabelPress}
					className="text-foreground/80 font-medium"
				>
					{label}
				</FormLabel>
			)}

			<Input
				ref={inputRef}
				aria-labelledby={formItemNativeID}
				aria-describedby={
					!error
						? `${formDescriptionNativeID}`
						: `${formDescriptionNativeID} ${formMessageNativeID}`
				}
				aria-invalid={!!error}
				onChangeText={onChange}
				className={cn(
					"bg-background border-input/30 rounded-xl",
					"focus:border-primary focus:ring-1 focus:ring-primary/20",
					"transition-all duration-200 ease-in-out rounded-2xl",
					error &&
						"border-destructive/50 focus:border-destructive focus:ring-destructive/20",
				)}
				{...props}
			/>

			{!!description && <FormDescription>{description}</FormDescription>}
			<FormMessage />
		</FormItem>
	);
});

FormInput.displayName = "FormInput";

const FormTextarea = React.forwardRef<
	React.ComponentRef<typeof Textarea>,
	FormItemProps<typeof Textarea, string>
>(({ label, description, onChange, ...props }, ref) => {
	const textareaRef = React.useRef<React.ComponentRef<typeof Textarea>>(null);
	const {
		error,
		formItemNativeID,
		formDescriptionNativeID,
		formMessageNativeID,
	} = useFormField();

	React.useImperativeHandle(ref, () => {
		if (!textareaRef.current) {
			return {} as React.ComponentRef<typeof Textarea>;
		}
		return textareaRef.current;
	}, []); // Fixed dependency array

	function handleOnLabelPress() {
		if (!textareaRef.current) {
			return;
		}
		if (textareaRef.current.isFocused()) {
			textareaRef.current?.blur();
		} else {
			textareaRef.current?.focus();
		}
	}

	return (
		<FormItem>
			{!!label && (
				<FormLabel
					nativeID={formItemNativeID}
					onPress={handleOnLabelPress}
					className="text-foreground/80 font-medium"
				>
					{label}
				</FormLabel>
			)}

			<Textarea
				ref={textareaRef}
				aria-labelledby={formItemNativeID}
				aria-describedby={
					!error
						? `${formDescriptionNativeID}`
						: `${formDescriptionNativeID} ${formMessageNativeID}`
				}
				aria-invalid={!!error}
				onChangeText={onChange}
				className={cn(
					"bg-background border-input/30 rounded-xl min-h-[120px]",
					"focus:border-primary focus:ring-1 focus:ring-primary/20",
					"transition-all duration-200 ease-in-out",
					error &&
						"border-destructive/50 focus:border-destructive focus:ring-destructive/20",
				)}
				{...props}
			/>
			{!!description && <FormDescription>{description}</FormDescription>}
			<FormMessage />
		</FormItem>
	);
});

FormTextarea.displayName = "FormTextarea";

const FormRadioGroup = React.forwardRef<
	React.ComponentRef<typeof RadioGroup>,
	Omit<FormItemProps<typeof RadioGroup, string>, "onValueChange">
>(({ label, description, value, onChange, ...props }, ref) => {
	const {
		error,
		formItemNativeID,
		formDescriptionNativeID,
		formMessageNativeID,
	} = useFormField();

	return (
		<FormItem className="gap-3">
			<View>
				{!!label && <FormLabel nativeID={formItemNativeID}>{label}</FormLabel>}
				{!!description && (
					<FormDescription className="pt-0">{description}</FormDescription>
				)}
			</View>
			<RadioGroup
				ref={ref}
				aria-labelledby={formItemNativeID}
				aria-describedby={
					!error
						? `${formDescriptionNativeID}`
						: `${formDescriptionNativeID} ${formMessageNativeID}`
				}
				aria-invalid={!!error}
				onValueChange={onChange}
				value={value}
				{...props}
			/>

			<FormMessage />
		</FormItem>
	);
});

FormRadioGroup.displayName = "FormRadioGroup";

const FormSwitch = React.forwardRef<
	React.ComponentRef<typeof Switch>,
	Omit<FormItemProps<typeof Switch, boolean>, "checked" | "onCheckedChange">
>(({ label, description, value, onChange, ...props }, ref) => {
	const switchRef = React.useRef<React.ComponentRef<typeof Switch>>(null);
	const {
		error,
		formItemNativeID,
		formDescriptionNativeID,
		formMessageNativeID,
	} = useFormField();

	React.useImperativeHandle(ref, () => {
		if (!switchRef.current) {
			return {} as React.ComponentRef<typeof Switch>;
		}
		return switchRef.current;
	}, []); // Fixed dependency array

	function handleOnLabelPress() {
		onChange?.(!value);
	}

	return (
		<FormItem className="px-1">
			<View className="flex-row gap-3 items-center">
				<Switch
					ref={switchRef}
					aria-labelledby={formItemNativeID}
					aria-describedby={
						!error
							? `${formDescriptionNativeID}`
							: `${formDescriptionNativeID} ${formMessageNativeID}`
					}
					aria-invalid={!!error}
					onCheckedChange={onChange}
					checked={value}
					className="transition-opacity duration-200"
					{...props}
				/>
				{!!label && (
					<FormLabel
						className="pb-0 text-foreground/80 font-medium"
						nativeID={formItemNativeID}
						onPress={handleOnLabelPress}
					>
						{label}
					</FormLabel>
				)}
			</View>
			{!!description && <FormDescription>{description}</FormDescription>}
			<FormMessage />
		</FormItem>
	);
});

FormSwitch.displayName = "FormSwitch";

export {
	Form,
	FormDescription,
	FormField,
	FormInput,
	FormItem,
	FormLabel,
	FormMessage,
	FormRadioGroup,
	FormSwitch,
	FormTextarea,
	useFormField,
};
