import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { fetchLibrary } from "../api/books";
import { API_BASE_URL } from "../config";
import {
  downloadEpubWithAuth,
  isEpubDownloaded,
  getLocalEpubPath,
} from "../services/offlineBooks";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useNavigation } from "@react-navigation/native";

type LibraryItem = {
  bookId: string;
  title: string;
  author: string;
  slug: string;
  allowEbook: boolean;
  allowAudio: boolean;
  ebookUrl?: string;
  audioUrl?: string;
  grantedAt: string;
};

const LibraryScreen: React.FC = () => {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [offlineMap, setOfflineMap] = useState<Record<string, boolean>>({});
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const loadLibrary = async () => {
    setLoading(true);
    try {
      const data = await fetchLibrary();
      setItems(data);

      const map: Record<string, boolean> = {};
      for (const item of data) {
        map[item.bookId] = await isEpubDownloaded(item.bookId);
      }
      setOfflineMap(map);
    } catch (e) {
      Alert.alert("Ошибка", "Не удалось загрузить библиотеку");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  // 📖 Читать онлайн внутри ридера (по HTTP/HTTPS URL)
  const openOnline = (item: LibraryItem) => {
    if (!item.ebookUrl) {
      return Alert.alert("Нет файла EPUB");
    }

    const src = item.ebookUrl.startsWith("http")
      ? item.ebookUrl
      : `${API_BASE_URL}${item.ebookUrl}`;

    nav.navigate("EpubReader", {
      bookId: item.bookId,
      title: item.title,
      src,
    });
  };

  // 💾 Скачать/открыть оффлайн
  const onOfflinePress = async (item: LibraryItem) => {
    try {
      setDownloading(item.bookId);

      const downloaded = offlineMap[item.bookId];
      if (!downloaded) {
        await downloadEpubWithAuth(item.bookId);
        setOfflineMap((p) => ({ ...p, [item.bookId]: true }));
      }

      const src = getLocalEpubPath(item.bookId); // file:///.../book.epub

      nav.navigate("EpubReader", {
        bookId: item.bookId,
        title: item.title,
        src,
      });
    } catch (e: any) {
      Alert.alert("Ошибка", e.message ?? "Не удалось открыть книгу");
    } finally {
      setDownloading(null);
    }
  };

  const renderItem = ({ item }: { item: LibraryItem }) => {
    const downloaded = offlineMap[item.bookId];

    return (
      <View style={styles.item}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.author}>{item.author}</Text>

        <View style={styles.buttons}>
          {!!item.ebookUrl && (
            <TouchableOpacity onPress={() => openOnline(item)}>
              <Text style={styles.link}>Читать онлайн</Text>
            </TouchableOpacity>
          )}

          {item.allowEbook && (
            <TouchableOpacity onPress={() => onOfflinePress(item)}>
              <Text style={styles.link}>
                {downloading === item.bookId
                  ? "Скачиваем..."
                  : downloaded
                  ? "Открыть оффлайн"
                  : "Скачать оффлайн"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <FlatList<LibraryItem>
      contentContainerStyle={{ padding: 16 }}
      data={items}
      keyExtractor={(i) => i.bookId}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  item: { paddingVertical: 14, borderBottomWidth: 1, borderColor: "#eee" },
  title: { fontSize: 16, fontWeight: "bold" },
  author: { fontSize: 13, color: "#666" },
  buttons: { flexDirection: "row", marginTop: 10, gap: 20 },
  link: { color: "#007aff", fontSize: 15 },
});

export default LibraryScreen;
