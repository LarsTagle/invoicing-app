import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

export default function ViewClients({ navigation, route }) {
  const { client } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("ManageClients")}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Client Details</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.label}>Client ID</Text>
        <Text style={styles.detailText}>{client.client_id}</Text>
        <Text style={styles.label}>First Name</Text>
        <Text style={styles.detailText}>{client.first_name}</Text>
        <Text style={styles.label}>Last Name</Text>
        <Text style={styles.detailText}>{client.last_name}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.detailText}>{client.email || "-"}</Text>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.detailText}>{client.phone || "-"}</Text>
        <Text style={styles.label}>Company</Text>
        <Text style={styles.detailText}>{client.company_name || "-"}</Text>
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
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#007bff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  detailsContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 16,
    marginTop: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
});
