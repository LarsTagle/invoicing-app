import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import ClientForm from "../components/ClientForm";
import { insertClient } from "../database/db";
import { Ionicons } from "@expo/vector-icons";

export default function CreateClient({ navigation }) {
  const handleSubmit = async (client) => {
    try {
      await insertClient(
        client.first_name,
        client.last_name,
        client.email,
        client.phone,
        client.company_name
      );
      Alert.alert("Success", "Client created successfully!");
      navigation.navigate("ManageClients");
    } catch (error) {
      console.error("Failed to create client:", error);
      Alert.alert("Error", "Failed to create client. Please try again.");
    }
  };

  const handleCancel = () => {
    navigation.navigate("ManageClients");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("ManageClients")}
        >
          <Ionicons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Client</Text>
      </View>
      <ClientForm
        key={Date.now()} // Force remount to prevent compression
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  backButton: {
    paddingVertical: 8,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
});
