import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getClients, getInvoices } from "../database/db";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

export default function ManageClients({ navigation }) {
  const [clients, setClients] = useState([]);
  const [deletedClientIds, setDeletedClientIds] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [pendingCounts, setPendingCounts] = useState({});
  const [sortField, setSortField] = useState("id");

  const loadDeletedClientIds = async () => {
    try {
      const stored = await AsyncStorage.getItem("deletedClients");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load deleted client IDs:", error);
      return [];
    }
  };

  const saveDeletedClientIds = async (ids) => {
    try {
      await AsyncStorage.setItem("deletedClients", JSON.stringify(ids));
    } catch (error) {
      console.error("Failed to save deleted client IDs:", error);
    }
  };

  const fetchClientsAndInvoices = async () => {
    try {
      const data = await getClients();
      const invoices = await getInvoices();
      const deletedIds = await loadDeletedClientIds();
      setDeletedClientIds(deletedIds);
      const filteredClients = data.filter(
        (client) => !deletedIds.includes(client.id)
      );

      // Calculate pending invoice counts for each client
      const counts = {};
      filteredClients.forEach((client) => {
        const unpaidCount = invoices.filter(
          (invoice) =>
            invoice.client_id === client.client_id &&
            invoice.status === "Unpaid"
        ).length;
        counts[client.id] = unpaidCount;
      });
      setPendingCounts(counts);
      setClients(filteredClients);
    } catch (error) {
      console.error("Failed to fetch clients or invoices:", error);
      Alert.alert("Error", "Failed to load clients. Please try again.");
    }
  };

  useEffect(() => {
    fetchClientsAndInvoices();
  }, []);

  const handleDelete = (id, fullName) => {
    Alert.alert(
      "Delete Client",
      `Are you sure you want to delete ${fullName}? This will permanently remove the client from the list but keep it in the database.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const newDeletedClientIds = [...deletedClientIds, id];
            setDeletedClientIds(newDeletedClientIds);
            saveDeletedClientIds(newDeletedClientIds);
            setClients((prevClients) =>
              prevClients.filter((client) => client.id !== id)
            );
            setPendingCounts((prev) => {
              const newCounts = { ...prev };
              delete newCounts[id];
              return newCounts;
            });
            setSelectedClientId(null);
            Alert.alert("Success", "Client removed from the list.");
          },
        },
      ]
    );
  };

  const handleView = (client) => {
    navigation.navigate("ViewClients", { client });
  };

  const handleRowClick = (id) => {
    setSelectedClientId((prev) => (prev === id ? null : id));
  };

  const sortedClients = [...clients].sort((a, b) => {
    switch (sortField) {
      case "id":
        return a.client_id.localeCompare(b.client_id);
      case "last_name":
        return a.last_name.localeCompare(b.last_name);
      case "pending":
        return (pendingCounts[b.id] || 0) - (pendingCounts[a.id] || 0);
      case "company":
        const companyA = a.company_name || "";
        const companyB = b.company_name || "";
        return companyA.localeCompare(companyB);
      default:
        return a.client_id.localeCompare(b.client_id);
    }
  });

  const renderClientItem = ({ item }) => (
    <View>
      <TouchableOpacity
        style={styles.clientRow}
        onPress={() => handleRowClick(item.id)}
      >
        <Text style={styles.clientText}>{item.client_id}</Text>
        <Text style={styles.clientText}>{item.last_name}</Text>
        <Text style={styles.clientText}>{item.first_name}</Text>
        <Text style={styles.clientText}>{pendingCounts[item.id] || 0}</Text>
        <Text style={styles.clientText}>{item.company_name || "-"}</Text>
      </TouchableOpacity>
      {selectedClientId === item.id && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => handleView(item)}
          >
            <Text style={styles.actionButtonText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate("EditClient", { client: item })}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() =>
              handleDelete(item.id, `${item.first_name} ${item.last_name}`)
            }
          >
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("LandingPage")}
        >
          <Ionicons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Clients</Text>
      </View>
      <View style={styles.controlsContainer}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={sortField}
            style={styles.picker}
            onValueChange={(itemValue) => setSortField(itemValue)}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="Sort by Client Number" value="id" />
            <Picker.Item label="Sort by Last Name" value="last_name" />
            <Picker.Item label="Sort by Number of Pendings" value="pending" />
            <Picker.Item label="Sort by Company" value="company" />
          </Picker>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate("CreateClient")}
          >
            <Text style={styles.buttonText}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.tableContainer}>
        <View style={styles.clientRow}>
          <Text style={[styles.clientText, styles.headerText]}>Client ID</Text>
          <Text style={[styles.clientText, styles.headerText]}>Last Name</Text>
          <Text style={[styles.clientText, styles.headerText]}>First Name</Text>
          <Text style={[styles.clientText, styles.headerText]}>Pendings</Text>
          <Text style={[styles.clientText, styles.headerText]}>Company</Text>
        </View>
        <FlatList
          data={sortedClients}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
    width: 200,
    marginRight: 10,
  },
  picker: {
    width: "100%",
  },
  pickerItem: {
    fontSize: 14,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    flexDirection: "row",
  },
  createButton: {
    backgroundColor: "#28a745",
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
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
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 4,
  },
  viewButton: {
    backgroundColor: "#007bff",
  },
  editButton: {
    backgroundColor: "#28a745",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
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
