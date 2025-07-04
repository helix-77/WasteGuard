import React, { createContext, useContext, useState, ReactNode } from "react";

interface CameraContextType {
	isCameraOpen: boolean;
	setIsCameraOpen: (open: boolean) => void;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

interface CameraProviderProps {
	children: ReactNode;
}

export function CameraProvider({ children }: CameraProviderProps) {
	const [isCameraOpen, setIsCameraOpen] = useState(false);

	return (
		<CameraContext.Provider value={{ isCameraOpen, setIsCameraOpen }}>
			{children}
		</CameraContext.Provider>
	);
}

export function useCameraContext() {
	const context = useContext(CameraContext);
	if (context === undefined) {
		throw new Error("useCameraContext must be used within a CameraProvider");
	}
	return context;
}
