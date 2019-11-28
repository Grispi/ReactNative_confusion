import React from "react";
import Main from "./components/MainComponent";
import { Provider } from "react-redux";
import { ConfigureStore } from "./redux/configureStore";
import { StyleSheet, SafeAreaView } from "react-native";

const store = ConfigureStore();

export default function App() {
  return (
    // <SafeAreaView style={styles.safeArea}>
    <Provider store={store}>
      <Main />
    </Provider>
    // {/* </SafeAreaView> */}
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ddd"
  }
});
