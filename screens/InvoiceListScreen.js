// screens/InvoiceListScreen.js
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View, RefreshControl } from "react-native";
import InvoiceItemCard from "../components/InvoiceItemCard";
import { getInvoices } from "../database/db";

export default function InvoiceListScreen() {
  const [invoices, setInvoices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

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

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No invoices found. Create one!</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={invoices}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContent: {
    padding: 16,
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
