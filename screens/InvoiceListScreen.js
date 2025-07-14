import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import InvoiceItemCard from "../components/InvoiceItemCard";
import { getInvoices } from "../database/db";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function InvoiceListScreen({ navigation }) {
  const [invoices, setInvoices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sortField, setSortField] = useState("id");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadDeletedInvoiceIds = async () => {
    try {
      const stored = await AsyncStorage.getItem("deletedInvoices");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load deleted invoice IDs:", error);
      return [];
    }
  };

  const fetchInvoices = async () => {
    try {
      const data = await getInvoices();
      const deletedIds = await loadDeletedInvoiceIds();
      const validInvoices = data.filter(
        (invoice) =>
          !deletedIds.includes(invoice.id) &&
          invoice &&
          invoice.id &&
          invoice.total != null
      );
      setInvoices(validInvoices);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInvoices();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const toggleStatusFilter = () => {
    setStatusFilter((prev) =>
      prev === "All" ? "Paid" : prev === "Paid" ? "Unpaid" : "All"
    );
  };

  const filteredInvoices = invoices.filter((invoice) =>
    statusFilter === "All" ? true : invoice.status === statusFilter
  );

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    switch (sortField) {
      case "id":
        return a.id - b.id;
      case "client":
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameB.localeCompare(nameA);
      case "status":
        return a.status.localeCompare(b.status);
      case "due_date":
        return new Date(a.due_date) - new Date(b.due_date);
      case "total":
        return a.total - b.total;
      default:
        return a.id - b.id;
    }
  });

  const renderEmptyState = () => {
    let message;
    switch (statusFilter) {
      case "All":
        message = "No invoices found. Create one!";
        break;
      case "Paid":
        message = "No paid invoice found.";
        break;
      case "Unpaid":
        message = "All invoice paid!";
        break;
      default:
        message = "No invoices found. Create one!";
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{message}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("LandingPage")}
        >
          <Ionicons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoices</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate("InvoiceForm")}
        >
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        {invoices.length > 0 && (
          <View style={styles.controlsContainer}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={sortField}
                style={styles.picker}
                onValueChange={(itemValue) => setSortField(itemValue)}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Sort by Invoice Number" value="id" />
                <Picker.Item label="Sort by Client Name" value="client" />
                <Picker.Item label="Sort by Status" value="status" />
                <Picker.Item label="Sort by Due Date" value="due_date" />
                <Picker.Item label="Sort by Total" value="total" />
              </Picker>
            </View>
            <TouchableOpacity
              style={styles.statusButton}
              onPress={toggleStatusFilter}
            >
              <Text style={styles.statusButtonText}>{statusFilter}</Text>
            </TouchableOpacity>
          </View>
        )}
        <FlatList
          data={sortedInvoices}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <InvoiceItemCard invoice={item} onStatusUpdate={fetchInvoices} />
          )}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
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
  },
  createButton: {
    backgroundColor: "#28a745",
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
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
    marginHorizontal: 10,
  },
  picker: {
    width: "100%",
  },
  pickerItem: {
    fontSize: 14,
  },
  statusButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    width: 100,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  listContent: {
    paddingBottom: 16,
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
});
