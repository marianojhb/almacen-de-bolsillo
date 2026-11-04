import type { ImagePickerAsset } from "expo-image-picker";
import { apiRequest } from "./apiClient";

type ProfileImageResponse = {
  profileImageUrl: string;
};

export function uploadProfileImageRequest(userId: number, asset: ImagePickerAsset): Promise<ProfileImageResponse> {
  const formData = new FormData();
  const filename = asset.fileName ?? "profile-image.jpg";
  const mimeType = asset.mimeType ?? "image/jpeg";

  if (asset.file) {
    formData.append("photo", asset.file, filename);
  } else {
    formData.append("photo", {
      uri: asset.uri,
      name: filename,
      type: mimeType,
    } as unknown as Blob);
  }

  return apiRequest<ProfileImageResponse>(`/users/${userId}/profile-image`, {
    method: "POST",
    body: formData,
  });
}
