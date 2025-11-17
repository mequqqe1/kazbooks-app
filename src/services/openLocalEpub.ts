// src/services/openLocalEpub.ts
import { Platform, Linking } from "react-native";
import * as FileSystem from "expo-file-system";

export async function openLocalEpub(localPath: string) {
  if (Platform.OS === "android") {
    const contentUri = await FileSystem.getContentUriAsync(localPath);
    return Linking.openURL(contentUri);
  } else {
    return Linking.openURL(localPath);
  }
}
