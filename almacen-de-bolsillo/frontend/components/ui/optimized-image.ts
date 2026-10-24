import { Image as ExpoImage, type ImageProps } from "expo-image";
import type { ComponentType } from "react";

// Expo Image 57's class type is not recognized as JSX by this React 19 setup.
// Keep the runtime component while exposing its public props as a React component.
export const OptimizedImage = ExpoImage as unknown as ComponentType<ImageProps>;
