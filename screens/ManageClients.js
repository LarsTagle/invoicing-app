import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { getClients } from "../database/db";

export default function ManageClients({ navigation }) {
  const [clients, setClients] = useState([]);

  // Fetch clients from the database
  const fetchClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      Alert.alert("Error", "Failed to load clients. Please try again.");
    }
  };

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Placeholder for Sort button
  const handleSort = () => {
    Alert.alert("Sort", "Sort functionality not implemented yet.");
  };

  // Placeholder for Create button
  const handleCreate = () => {
    Alert.alert("Create", "Create functionality not implemented yet.");
  };

  // Render client item
  const renderClientItem = ({ item }) => (
    <View style={styles.clientRow}>
      <Text style={styles.clientText}>{item.client_id}</Text>
      <Text style={styles.clientText}>{item.first_name}</Text>
      <Text style={styles.clientText}>{item.last_name}</Text>
      <Text style={styles.clientText}>{item.email || "-"}</Text>
      <Text style={styles.clientText}>{item.phone || "-"}</Text>
      <Text style={styles.clientText}>{item.company_name || "-"}</Text>
      <View style={styles.actionColumn}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() =>
            Alert.alert("Edit", "Edit functionality not implemented yet.")
          }
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() =>
            Alert.alert("Delete", "Delete functionality not implemented yet.")
          }
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Dashboard")}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Clients</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.sortButton} onPress={handleSort}>
          <Text style={styles.buttonText}>Sort</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.buttonText}>Create</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tableContainer}>
        <View style={styles.clientRow}>
          <Text style={[styles.clientText, styles.headerText]}>Client ID</Text>
          <Text style={[styles.clientText, styles.headerText]}>First Name</Text>
          <Text style={[styles.clientText, styles.headerText]}>Last Name</Text>
          <Text style={[styles.clientText, styles.headerText]}>Email</Text>
          <Text style={[styles.clientText, styles.headerText]}>Phone</Text>
          <Text style={[styles.clientText, styles.headerText]}>Company</Text>
          <Text style={[styles.clientText, styles.headerText]}>Actions</Text>
        </View>
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderClientItem}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No clients found.</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
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
    fontSize: 16,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sortButton: {
    backgroundColor: "#007bff",
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flex: 1,
    marginRight: 8,
  },
  createButton: {
    backgroundColor: "#28a745",
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  tableContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
  },
  clientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  clientText: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    color: "#333",
  },
  headerText: {
    fontWeight: "bold",
  },
  actionColumn: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
  },
  editButton: {
    backgroundColor: "#28a745",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 16,
  },
});
