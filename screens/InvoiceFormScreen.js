import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import { insertInvoice, insertItem } from "../database/db";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function InvoiceFormScreen({ navigation }) {
  // Form state
  const [client, setClient] = useState("");
  const [issueDate, setIssueDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  // Date picker visibility
  const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  // Calculate total
  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  // Add item to the list
  const addItem = () => {
    if (!itemName || !itemQuantity || !itemPrice) {
      Alert.alert("Error", "Please fill in all item fields.");
      return;
    }

    const quantity = parseInt(itemQuantity);
    const price = parseFloat(itemPrice);

    if (isNaN(quantity) || quantity <= 0 || isNaN(price) || price <= 0) {
      Alert.alert("Error", "Quantity and price must be positive numbers.");
      return;
    }

    setItems([...items, { name: itemName, quantity, price }]);
    setItemName("");
    setItemQuantity("");
    setItemPrice("");
  };

  // Clear form state
  const clearForm = () => {
    setClient("");
    setIssueDate(new Date());
    setDueDate(new Date());
    setItems([]);
    setItemName("");
    setItemQuantity("");
    setItemPrice("");
    setShowIssueDatePicker(false);
    setShowDueDatePicker(false);
  };

  // Submit invoice
  const handleSubmit = async () => {
    if (!client || items.length === 0) {
      Alert.alert("Error", "Client name and at least one item are required.");
      return;
    }

    try {
      // Log parameters before inserting
      console.log("Submitting invoice:", {
        client,
        issue_date: issueDate.toISOString(),
        due_date: dueDate.toISOString(),
        total,
        status: "Unpaid",
      });

      // Insert invoice into database
      const invoiceId = await insertInvoice(
        client,
        issueDate.toISOString(),
        dueDate.toISOString(),
        total,
        "Unpaid"
      );

      // Insert items into database
      for (const item of items) {
        await insertItem(invoiceId, item.name, item.quantity, item.price);
      }

      Alert.alert("Success", "Invoice created successfully!");
      clearForm(); // Clear the form after successful submission
      navigation.navigate("InvoiceList");
    } catch (error) {
      Alert.alert("Error", "Failed to create invoice. Please try again.");
      console.error("Submit error:", error);
    }
  };

  // Render item in the item list
  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.itemText}>{item.quantity}</Text>
      <Text style={styles.itemText}>${item.price.toFixed(2)}</Text>
      <Text style={styles.itemText}>
        ${(item.quantity * item.price).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Client Name</Text>
      <TextInput
        style={styles.input}
        value={client}
        onChangeText={setClient}
        placeholder="Enter client name"
      />

      <Text style={styles.label}>Issue Date</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowIssueDatePicker(true)}
      >
        <Text>{issueDate.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showIssueDatePicker && (
        <DateTimePicker
          value={issueDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowIssueDatePicker(false);
            if (selectedDate) setIssueDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>Due Date</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDueDatePicker(true)}
      >
        <Text>{dueDate.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDueDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDueDatePicker(false);
            if (selectedDate) setDueDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>Add Item</Text>
      <TextInput
        style={styles.input}
        value={itemName}
        onChangeText={setItemName}
        placeholder="Item name"
      />
      <TextInput
        style={styles.input}
        value={itemQuantity}
        onChangeText={setItemQuantity}
        placeholder="Quantity"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        value={itemPrice}
        onChangeText={setItemPrice}
        placeholder="Unit price"
        keyboardType="numeric"
      />
      <Button title="Add Item" onPress={addItem} />

      <Text style={styles.label}>Items</Text>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={() => (
          <View style={styles.itemRow}>
            <Text style={[styles.itemText, styles.headerText]}>Name</Text>
            <Text style={[styles.itemText, styles.headerText]}>Qty</Text>
            <Text style={[styles.itemText, styles.headerText]}>Price</Text>
            <Text style={[styles.itemText, styles.headerText]}>Subtotal</Text>
          </View>
        )}
      />

      <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
      <Button title="Create Invoice" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemText: {
    flex: 1,
    textAlign: "center",
  },
  headerText: {
    fontWeight: "bold",
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "right",
  },
});
