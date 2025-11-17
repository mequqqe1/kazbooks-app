import React from "react";
import { StatusBar } from "expo-status-bar";

import { AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";

import { ReaderProvider } from "@epubjs-react-native/core";

export default function App() {
  return (
    <AuthProvider>
      <ReaderProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </ReaderProvider>
    </AuthProvider>
  );
}
