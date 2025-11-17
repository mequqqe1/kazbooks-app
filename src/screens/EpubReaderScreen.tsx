import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import {
  downloadEpubWithAuth,
  isEpubDownloaded,
  getLocalEpubPath,
} from "../services/offlineBooks";

type Props = NativeStackScreenProps<RootStackParamList, "EpubReader">;

const EpubReaderScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookId, title } = route.params;
  const [localPath, setLocalPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: title || "Чтение" });

    (async () => {
      try {
        let path = getLocalEpubPath(bookId);
        const has = await isEpubDownloaded(bookId);
        if (!has) {
          path = await downloadEpubWithAuth(bookId);
        }
        setLocalPath(path);
      } catch (e: any) {
        console.error(e);
        Alert.alert("Ошибка", "Не удалось открыть книгу");
      } finally {
        setLoading(false);
      }
    })();
  }, [bookId]);

  if (loading || !localPath) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ВАЖНО: путь кодируем
  const encodedPath = encodeURI(localPath);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>EPUB Reader</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <style>
    html, body, #viewer { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; }
    body { background: #111; color: #fff; }
    #viewer { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
  </style>
  <script src="https://unpkg.com/epubjs/dist/epub.js"></script>
</head>
<body>
  <div id="viewer"></div>
  <script>
    (function() {
      const bookUrl = "${encodedPath}";
      const book = ePub(bookUrl);

      const rendition = book.renderTo("viewer", {
        width: "100%",
        height: "100%",
        spread: "none"
      });

      rendition.display();

      // свайпы / стрелки
      let startX = null;
      document.addEventListener("touchstart", function(e) {
        startX = e.touches[0].clientX;
      });

      document.addEventListener("touchend", function(e) {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (dx < -30) {
          rendition.next();
        } else if (dx > 30) {
          rendition.prev();
        }
        startX = null;
      });

    })();
  </script>
</body>
</html>
`;

  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html }}
      style={{ flex: 1 }}
      javaScriptEnabled
      allowFileAccess
      allowingReadAccessToURL={localPath}
    />
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default EpubReaderScreen;
