import { useState, useCallback } from "react";
import { ImageUploadService } from "@/lib/services/imageUploadService";

/**
 * Hook for managing image uploads with loading states
 */
export function useImageUpload() {
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);

	/**
	 * Upload an image and return the public URL
	 */
	const uploadImage = useCallback(
		async (imageUri: string, fileName?: string): Promise<string | null> => {
			try {
				setUploading(true);
				setUploadError(null);

				const publicUrl = await ImageUploadService.uploadImage(
					imageUri,
					fileName,
				);
				return publicUrl;
			} catch (error) {
				console.error("Image upload failed:", error);
				setUploadError(
					error instanceof Error ? error.message : "Failed to upload image",
				);
				return null;
			} finally {
				setUploading(false);
			}
		},
		[],
	);

	/**
	 * Delete an image from storage
	 */
	const deleteImage = useCallback(
		async (imagePath: string): Promise<boolean> => {
			try {
				await ImageUploadService.deleteImage(imagePath);
				return true;
			} catch (error) {
				console.error("Image deletion failed:", error);
				setUploadError(
					error instanceof Error ? error.message : "Failed to delete image",
				);
				return false;
			}
		},
		[],
	);

	/**
	 * Reset error state
	 */
	const clearError = useCallback(() => {
		setUploadError(null);
	}, []);

	return {
		uploading,
		uploadError,
		uploadImage,
		deleteImage,
		clearError,
	};
}
