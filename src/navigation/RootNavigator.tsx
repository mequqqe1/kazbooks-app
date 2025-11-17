import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import BooksScreen from "../screens/BooksScreen";
import LibraryScreen from "../screens/LibraryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import BookDetailsScreen from "../screens/BookDetailsScreen";
import CheckoutOnlineScreen from "../screens/CheckoutOnlineScreen";
import EpubReaderScreen from "../screens/EpubReaderScreen";
import LoginScreen from "../screens/LoginScreen";
import { useAuth } from "../context/AuthContext";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  BookDetails: { bookId: string; title: string };
  CheckoutOnline: { bookId: string; title: string; minPrice: number };
  EpubReader: { bookId: string; title: string };
};

export type MainTabParamList = {
  Books: undefined;
  Library: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const AuthStack = createNativeStackNavigator();

const AuthNavigator = () => (
  <AuthStack.Navigator>
    <AuthStack.Screen
      name="Login"
      component={LoginScreen}
      options={{ title: "Вход" }}
    />
  </AuthStack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator>
    <Tab.Screen
      name="Books"
      component={BooksScreen}
      options={{ title: "Каталог" }}
    />
    <Tab.Screen
      name="Library"
      component={LibraryScreen}
      options={{ title: "Библиотека" }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: "Профиль" }}
    />
  </Tab.Navigator>
);

const RootNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="BookDetails"
              component={BookDetailsScreen}
              options={{ title: "Книга" }}
            />
            <Stack.Screen
              name="CheckoutOnline"
              component={CheckoutOnlineScreen}
              options={{ title: "Покупка" }}
            />
            <Stack.Screen
              name="EpubReader"
              component={EpubReaderScreen}
              options={{ title: "Чтение" }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
