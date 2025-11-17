import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { createOnlineOrder } from "../api/orders";

type Props = NativeStackScreenProps<RootStackParamList, "CheckoutOnline">;

const CheckoutOnlineScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookId, title, minPrice } = route.params;
  const [amount, setAmount] = useState(String(minPrice || 1000));
  const [loading, setLoading] = useState(false);

  const onBuy = async () => {
    const value = Number(amount);
    if (isNaN(value) || value < (minPrice || 0)) {
      Alert.alert("Ошибка", `Минимальная сумма: ${minPrice} ₸`);
      return;
    }
    try {
      setLoading(true);
      // backend ждёт сумму в тыйын
      await createOnlineOrder(bookId, value * 100);
      Alert.alert("Успех", "Книга куплена", [
        { text: "Ок", onPress: () => navigation.navigate("Main") },
      ]);
    } catch (e) {
      Alert.alert("Ошибка", "Не удалось оформить заказ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Покупка: {title}</Text>
      <Text style={styles.label}>Сумма (₸):</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={amount}
        onChangeText={setAmount}
      />
      <Button title={loading ? "..." : "Оплатить"} onPress={onBuy} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, marginBottom: 16 },
  label: { marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 8, marginBottom: 16 },
});

export default CheckoutOnlineScreen;
