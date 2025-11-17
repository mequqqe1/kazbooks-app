import React from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  useWindowDimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { Reader, useReader } from "@epubjs-react-native/core";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "EpubReader">;

const FONT_MIN = 80;
const FONT_MAX = 160;
const FONT_STEP = 10;

const darkTheme = {
  body: { background: "#000", color: "#fff" },
};
const lightTheme = {
  body: { background: "#fff", color: "#000" },
};

const EpubReaderScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookId, title, src } = route.params;
  const { width, height } = useWindowDimensions();

  console.log("📘 ROUTE PARAMS:", route.params);

  // 👇 useReader теперь будет работать, потому что есть ReaderProvider
  const { changeFontSize, changeTheme, goNext, goPrevious, isLoading } =
    useReader();

  const [fontSize, setFontSize] = React.useState<number>(100);
  const [theme, setTheme] = React.useState<"dark" | "light">("dark");
  const [authHeaders, setAuthHeaders] = React.useState<Record<string, string>>({});

  // 👇 Загрузи токен для авторизации
  React.useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          setAuthHeaders({ Authorization: `Bearer ${token}` });
        }
      } catch (e) {
        console.error("Failed to load token:", e);
      }
    };
    loadToken();
  }, []);

  React.useEffect(() => {
    navigation.setOptions({ title: title || "Чтение" });
  }, [navigation, title]);

  // Если src пустой — грузим демо EPUB
  const srcToUse =
    src && src.length > 0
      ? src
      : "https://s3.amazonaws.com/moby-dick/OPS/package.opf";

  console.log("📚 EPUB SOURCE:", srcToUse);

  return (
    <View style={styles.container}>
      <Reader
        src={srcToUse}
        width={width}
        height={height - 80}
        fileSystem={useFileSystem}
        defaultTheme={darkTheme}
        // 👇 Передай заголовки авторизации для HTTP запросов
        requestHeaders={authHeaders}
        // 👇 Важные параметры для стабильности
        enableSwipe={true}
        onStarted={() => {
          console.log("🚀 READER STARTED");
        }}
        onReady={() => {
          console.log("✅ READER READY");
        }}
        onDisplayError={(err: any) => {
          console.error("❌ DISPLAY ERROR:", err);
          Alert.alert("Ошибка открытия EPUB", JSON.stringify(err, null, 2));
        }}
        onError={(err) => {
          console.error("🔥 READER ERROR:", err);
          Alert.alert("Ошибка Reader", JSON.stringify(err, null, 2));
        }}
        onLocationChange={(loc) => {
          console.log("📍 Location changed:", loc?.start?.cfi);
        }}
        onPress={(cfi, rendition) => {
          console.log("👆 Pressed at:", cfi);
        }}
        onLoadStart={() => {
          console.log("⏳ Load started");
        }}
        onLoadEnd={() => {
          console.log("✅ Load ended");
        }}
      />

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={goPrevious} style={styles.btn}>
          <Text style={styles.btnText}>◀</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => {
            const next = Math.max(FONT_MIN, fontSize - FONT_STEP);
            console.log("🔤 Set font:", next);
            setFontSize(next);
            changeFontSize(`${next}%`);
          }}
          style={styles.btn}
        >
          <Text style={styles.btnText}>A-</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            const next = Math.min(FONT_MAX, fontSize + FONT_STEP);
            console.log("🔤 Set font:", next);
            setFontSize(next);
            changeFontSize(`${next}%`);
          }}
          style={styles.btn}
        >
          <Text style={styles.btnText}>A+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            const next = theme === "dark" ? "light" : "dark";
            console.log("🌗 Toggle theme:", next);
            setTheme(next);
            changeTheme(next === "dark" ? darkTheme : lightTheme);
          }}
          style={styles.btn}
        >
          <Text style={styles.btnText}>{theme === "dark" ? "☀" : "🌙"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goNext} style={styles.btn}>
          <Text style={styles.btnText}>▶</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 10 }}>Загрузка EPUB…</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    backgroundColor: "#111",
    borderTopWidth: 1,
    borderTopColor: "#222",
    height: 60,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#222",
  },
  btnText: { color: "#fff", fontSize: 16 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
});

export default EpubReaderScreen;