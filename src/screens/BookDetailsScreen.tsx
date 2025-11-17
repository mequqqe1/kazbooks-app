import React, { useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { fetchBookDetails, fetchBookAccess } from "../api/books";

type Props = NativeStackScreenProps<RootStackParamList, "BookDetails">;

const BookDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookId, title } = route.params;
  const [book, setBook] = useState<any>(null);
  const [access, setAccess] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [b, a] = await Promise.all([
        fetchBookDetails(bookId),
        fetchBookAccess(bookId),
      ]);
      setBook(b);
      setAccess(a);
    } catch (e) {
      Alert.alert("Ошибка", "Не удалось загрузить книгу");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    navigation.setOptions({ title: title || "Книга" });
    load();
  }, []);

  if (loading || !book) return <ActivityIndicator />;

  const hasAccess = access?.hasLicense && access?.allowEbook;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>{book.author}</Text>
      {book.minPriceTiyn && (
        <Text style={styles.price}>Мин. цена: {book.minPriceTiyn / 100} ₸</Text>
      )}

      <View style={{ height: 16 }} />

      {hasAccess ? (
        <Button
          title="Читать (EPUB)"
          onPress={() => {
            // просто открываем ссылка /api/downloads/{bookId}/ebook, 
            // её перехватит epub-читалка на девайсе
            const url = `${book.baseUrl ?? ""}${access.ebookUrl}`;
            Alert.alert("Открыть книгу", "На проде здесь открываем epub-viewer или Linking.openURL");
          }}
        />
      ) : (
        <Button
          title="Купить онлайн"
          onPress={() =>
            navigation.navigate("CheckoutOnline", {
              bookId,
              title: book.title,
              minPrice: book.pwywPolicy?.minPriceTiyn
                ? book.pwywPolicy.minPriceTiyn / 100
                : 1000,
            })
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "700" },
  author: { fontSize: 16, color: "#555", marginTop: 4 },
  price: { marginTop: 8, fontWeight: "500" },
});

export default BookDetailsScreen;
