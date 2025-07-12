import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function LandingPage({ navigation }) {
  const handleInfoPress = () => {
    Alert.alert(
      "About InvoicePro",
      "InvoicePro is your professional invoicing solution for managing invoices and clients efficiently.",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>InvoicePro</Text>
        <TouchableOpacity style={styles.infoButton} onPress={handleInfoPress}>
          <Ionicons name="information-circle" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("InvoiceList")}
        >
          <Text style={styles.buttonText}>Invoices</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            Alert.alert("Clients", "Client management coming soon!")
          }
        >
          <Text style={styles.buttonText}>Clients</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#28a745",
    textAlign: "center",
    flex: 1,
  },
  infoButton: {
    padding: 10,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#28a745",
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
