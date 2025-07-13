import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import { updateInvoiceStatus } from "../database/db";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function InvoiceItemCard({ invoice, onStatusUpdate }) {
  const loadDeletedInvoiceIds = async () => {
    try {
      const stored = await AsyncStorage.getItem("deletedInvoices");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load deleted invoice IDs:", error);
      return [];
    }
  };

  const saveDeletedInvoiceIds = async (ids) => {
    try {
      await AsyncStorage.setItem("deletedInvoices", JSON.stringify(ids));
    } catch (error) {
      console.error("Failed to save deleted invoice IDs:", error);
    }
  };

  const handleStatusToggle = async () => {
    try {
      const newStatus = invoice.status === "Paid" ? "Unpaid" : "Paid";
      await updateInvoiceStatus(invoice.id, newStatus);
      onStatusUpdate(); // Refresh the list
    } catch (error) {
      console.error("Failed to update status:", error);
      Alert.alert(
        "Error",
        "Failed to update invoice status. Please try again."
      );
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Invoice",
      `Are you sure you want to delete Invoice #${invoice.id}? This will remove the invoice from the list.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const deletedIds = await loadDeletedInvoiceIds();
              const newDeletedIds = [...deletedIds, invoice.id];
              await saveDeletedInvoiceIds(newDeletedIds);
              onStatusUpdate(); // Refresh the list
              Alert.alert("Success", "Invoice removed from the list.");
            } catch (error) {
              console.error("Failed to delete invoice:", error);
              Alert.alert(
                "Error",
                "Failed to remove invoice. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  // Ensure total is a number and format to 2 decimal places
  const formattedTotal =
    invoice.total != null ? Number(invoice.total).toFixed(2) : "0.00";

  // Combine first_name and last_name for display
  const clientName = `${invoice.last_name}, ${invoice.first_name}`.trim();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.invoiceNumber}>Invoice #{invoice.id}</Text>
        <Text
          style={[
            styles.status,
            invoice.status === "Paid" ? styles.statusPaid : styles.statusUnpaid,
          ]}
        >
          {invoice.status}
        </Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.label}>Client:</Text>
        <Text style={styles.value}>{clientName}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.label}>Due Date:</Text>
        <Text style={styles.value}>{invoice.due_date}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.label}>Total:</Text>
        <Text style={styles.value}>${formattedTotal}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.statusButton}
          onPress={handleStatusToggle}
        >
          <Text style={styles.buttonText}>
            Mark as {invoice.status === "Paid" ? "Unpaid" : "Paid"}
          </Text>
        </TouchableOpacity>
        {invoice.status === "Paid" && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  status: {
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusPaid: {
    backgroundColor: "#e6ffed",
    color: "#28a745",
  },
  statusUnpaid: {
    backgroundColor: "#ffe6e6",
    color: "#dc3545",
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: "#666",
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  statusButton: {
    backgroundColor: "#007bff",
    borderRadius: 4,
    padding: 12,
    flex: 1,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    borderRadius: 4,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
