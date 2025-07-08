import { supabase } from "@/config/supabase";
import * as FileSystem from "expo-file-system";

/**
 * Service for handling image uploads to Supabase Storage
 */
export class ImageUploadService {
	private static readonly BUCKET_NAME = "product-images";

	/**
	 * Upload an image to Supabase Storage
	 * @param imageUri - Local file URI of the image
	 * @param fileName - Optional custom filename
	 * @returns Promise<string> - Public URL of the uploaded image
	 */
	static async uploadImage(
		imageUri: string,
		fileName?: string,
	): Promise<string> {
		try {
			// Get current user
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				throw new Error("User not authenticated");
			}

			// Generate filename if not provided
			const timestamp = Date.now();
			const fileExtension = imageUri.split(".").pop() || "jpg";
			const finalFileName =
				fileName || `${user.id}/${timestamp}.${fileExtension}`;

			// Get file info to determine the MIME type
			const fileInfo = await FileSystem.getInfoAsync(imageUri);
			if (!fileInfo.exists) {
				throw new Error("Image file does not exist");
			}

			// Read the file as base64
			const base64 = await FileSystem.readAsStringAsync(imageUri, {
				encoding: FileSystem.EncodingType.Base64,
			});

			// Convert base64 to ArrayBuffer for React Native
			const byteCharacters = atob(base64);
			const byteNumbers = new Array(byteCharacters.length);
			for (let i = 0; i < byteCharacters.length; i++) {
				byteNumbers[i] = byteCharacters.charCodeAt(i);
			}
			const byteArray = new Uint8Array(byteNumbers);

			// Upload to Supabase Storage using the proper method for React Native
			const { data, error } = await supabase.storage
				.from(this.BUCKET_NAME)
				.upload(finalFileName, byteArray, {
					cacheControl: "3600",
					upsert: false,
					contentType: `image/${fileExtension}`,
				});

			if (error) {
				console.error("Storage upload error:", error);
				throw new Error(`Failed to upload image: ${error.message}`);
			}

			// Get public URL
			const { data: publicUrlData } = supabase.storage
				.from(this.BUCKET_NAME)
				.getPublicUrl(data.path);

			return publicUrlData.publicUrl;
		} catch (error) {
			console.error("Error uploading image:", error);
			throw error;
		}
	}

	/**
	 * Delete an image from Supabase Storage
	 * @param imagePath - Path of the image in storage
	 */
	static async deleteImage(imagePath: string): Promise<void> {
		try {
			const { error } = await supabase.storage
				.from(this.BUCKET_NAME)
				.remove([imagePath]);

			if (error) {
				console.error("Storage delete error:", error);
				throw new Error(`Failed to delete image: ${error.message}`);
			}
		} catch (error) {
			console.error("Error deleting image:", error);
			throw error;
		}
	}

	/**
	 * Extract file path from a public URL
	 * @param publicUrl - Full public URL of the image
	 * @returns string - File path for storage operations
	 */
	static extractPathFromUrl(publicUrl: string): string {
		const bucketPath = `/storage/v1/object/public/${this.BUCKET_NAME}/`;
		const pathIndex = publicUrl.indexOf(bucketPath);

		if (pathIndex === -1) {
			throw new Error("Invalid public URL format");
		}

		return publicUrl.substring(pathIndex + bucketPath.length);
	}
}
