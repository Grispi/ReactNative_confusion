import React from "react";
import Main from "./components/MainComponent";
import { StyleSheet, SafeAreaView } from "react-native";

export default function App() {
  return (
    // <SafeAreaView style={styles.safeArea}>
    <Main />
    // {/* </SafeAreaView> */}
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ddd"
  }
});
