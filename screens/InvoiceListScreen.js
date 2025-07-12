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

export default function InvoiceListScreen({ navigation }) {
  const [invoices, setInvoices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sortField, setSortField] = useState("id"); // Default sort by invoice number

  // Fetch invoices from the database
  const fetchInvoices = async () => {
    try {
      const data = await getInvoices();
      // Filter out invalid invoices
      const validInvoices = data.filter(
        (invoice) => invoice && invoice.id && invoice.total != null
      );
      setInvoices(validInvoices);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInvoices();
    setRefreshing(false);
  };

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Sort invoices based on selected field
  const sortedInvoices = [...invoices].sort((a, b) => {
    switch (sortField) {
      case "id":
        return a.id - b.id; // Numeric sort for invoice number
      case "client":
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameA.localeCompare(nameB); // Alphabetical sort for client name
      case "status":
        return a.status.localeCompare(b.status); // Alphabetical sort for status
      case "due_date":
        return new Date(a.due_date) - new Date(b.due_date); // Date sort
      case "total":
        return a.total - b.total; // Numeric sort for total
      default:
        return a.id - b.id; // Fallback to invoice number
    }
  });

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No invoices found. Create one!</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
  pickerContainer: {
    backgroundColor: "#fff", // White background for picker container
    borderWidth: 1,
    borderColor: "#000", // Thin black border
    borderRadius: 4,
    marginBottom: 10,
    marginTop: 10,
    width: 200, // Fixed width to make it smaller
  },
  picker: {
    width: "100%",
  },
  pickerItem: {
    fontSize: 14, // Ensure text is visible and readable
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
