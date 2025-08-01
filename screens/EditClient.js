import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import ClientForm from "../components/ClientForm";
import { updateClient } from "../database/db";
import { Ionicons } from "@expo/vector-icons";

export default function EditClient({ navigation, route }) {
  const { client } = route.params;

  const handleSubmit = async (updatedClient) => {
    try {
      await updateClient(
        client.id,
        client.client_id,
        updatedClient.first_name,
        updatedClient.last_name,
        updatedClient.email,
        updatedClient.phone,
        updatedClient.company_name
      );
      Alert.alert("Success", "Client updated successfully!");
      navigation.navigate("ManageClients");
    } catch (error) {
      console.error("Failed to update client:", error);
      Alert.alert("Error", "Failed to update client. Please try again.");
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
        <Text style={styles.headerTitle}>Edit Client</Text>
      </View>
      <ClientForm
        initialClient={client}
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
