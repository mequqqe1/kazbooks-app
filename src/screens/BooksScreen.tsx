import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, StyleSheet } from "react-native";
import { fetchBooks, Book } from "../api/books";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

const BooksScreen: React.FC<Props> = ({ navigation }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchBooks(q);
      setBooks(res.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput
        style={styles.search}
        placeholder="Поиск..."
        value={q}
        onChangeText={setQ}
        onSubmitEditing={load}
      />
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() =>
                navigation.navigate("BookDetails", { bookId: item.id, title: item.title })
              }
            >
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.author}>{item.author}</Text>
              {item.minPrice > 0 && (
                <Text style={styles.price}>от {item.minPrice} ₸</Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  search: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  title: { fontSize: 16, fontWeight: "600" },
  author: { color: "#555" },
  price: { marginTop: 4, fontWeight: "500" },
});

export default BooksScreen;
