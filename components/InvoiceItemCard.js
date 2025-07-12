import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { updateInvoiceStatus } from "../database/db";

export default function InvoiceItemCard({ invoice, onStatusUpdate }) {
  const handleStatusToggle = async () => {
    try {
      const newStatus = invoice.status === "Paid" ? "Unpaid" : "Paid";
      await updateInvoiceStatus(invoice.id, newStatus);
      onStatusUpdate(); // Refresh the list
    } catch (error) {
      console.error("Failed to update status:", error);
    }
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
      <TouchableOpacity style={styles.button} onPress={handleStatusToggle}>
        <Text style={styles.buttonText}>
          Mark as {invoice.status === "Paid" ? "Unpaid" : "Paid"}
        </Text>
      </TouchableOpacity>
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
  button: {
    backgroundColor: "#007bff",
    borderRadius: 4,
    padding: 12,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
