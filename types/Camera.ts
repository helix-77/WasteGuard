export interface CameraScannerProps {
	isVisible: boolean;
	onClose: () => void;
	onImageCaptured: (imageUri: string) => void;
	mode?: CameraMode;
}

export type CameraMode = "photo";

export interface ScanStatus {
	image: string | null;
	isComplete: boolean;
}

export interface CapturedPhoto {
	uri: string;
	width: number;
	height: number;
	base64?: string;
}
