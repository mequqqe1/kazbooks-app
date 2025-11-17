import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Профиль</Text>
      <Text>{user?.email}</Text>
      <View style={{ height: 16 }} />
      <Button title="Выйти" onPress={logout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, marginBottom: 8 },
});

export default ProfileScreen;
