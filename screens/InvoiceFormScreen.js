import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { insertInvoice, insertItem } from "../database/db";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function InvoiceFormScreen({ navigation }) {
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [issueDate, setIssueDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [showItems, setShowItems] = useState(true);
  const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  // Calculate total
  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  // Add item to the list
  const addItem = useCallback(() => {
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

    setItems((prev) => [...prev, { name: itemName, quantity, price }]);
    setItemName("");
    setItemQuantity("");
    setItemPrice("");
  }, [itemName, itemQuantity, itemPrice]);

  // Clear form state
  const clearForm = useCallback(() => {
    setFirstName("");
    setLastName("");
    setIssueDate(new Date());
    setDueDate(new Date());
    setItems([]);
    setItemName("");
    setItemQuantity("");
    setItemPrice("");
    setShowIssueDatePicker(false);
    setShowDueDatePicker(false);
    setShowItems(true);
  }, []);

  // Submit invoice
  const handleSubmit = useCallback(async () => {
    if (!firstName || !lastName || items.length === 0) {
      Alert.alert(
        "Error",
        "First name, last name, and at least one item are required."
      );
      return;
    }

    const client = `${firstName} ${lastName}`.trim();

    try {
      console.log("Submitting invoice:", {
        client,
        issue_date: issueDate.toISOString(),
        due_date: dueDate.toISOString(),
        total,
        status: "Unpaid",
      });

      const invoiceId = await insertInvoice(
        client,
        issueDate.toISOString(),
        dueDate.toISOString(),
        total,
        "Unpaid"
      );

      for (const item of items) {
        await insertItem(invoiceId, item.name, item.quantity, item.price);
      }

      Alert.alert("Success", "Invoice created successfully!");
      clearForm();
      navigation.navigate("InvoiceList");
    } catch (error) {
      Alert.alert("Error", "Failed to create invoice. Please try again.");
      console.error("Submit error:", error);
    }
  }, [
    firstName,
    lastName,
    issueDate,
    dueDate,
    items,
    total,
    clearForm,
    navigation,
  ]);

  // Toggle Items list visibility
  const toggleItemsVisibility = useCallback(() => {
    setShowItems((prev) => !prev);
  }, []);

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Client Name</Text>
        <View style={styles.row}>
          <TextInput
            key="firstName"
            style={[styles.input, styles.halfInput]}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First Name"
          />
          <TextInput
            key="lastName"
            style={[styles.input, styles.halfInput]}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last Name"
          />
        </View>

        <Text style={styles.label}>Dates</Text>
        <View style={styles.row}>
          <View style={styles.halfContainer}>
            <Text style={styles.subLabel}>Issue Date</Text>
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
          </View>
          <View style={styles.halfContainer}>
            <Text style={styles.subLabel}>Due Date</Text>
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
          </View>
        </View>

        <Text style={styles.label}>Add Item</Text>
        <TextInput
          key="itemName"
          style={styles.input}
          value={itemName}
          onChangeText={setItemName}
          placeholder="Item name"
        />
        <View style={styles.row}>
          <TextInput
            key="itemQuantity"
            style={[styles.input, styles.halfInput]}
            value={itemQuantity}
            onChangeText={setItemQuantity}
            placeholder="Quantity"
            keyboardType="numeric"
          />
          <TextInput
            key="itemPrice"
            style={[styles.input, styles.halfInput]}
            value={itemPrice}
            onChangeText={setItemPrice}
            placeholder="Unit price"
            keyboardType="numeric"
          />
        </View>
        <Button title="Add Item" onPress={addItem} />

        <View style={styles.itemsHeader}>
          <Text style={styles.label}>Items</Text>
          <TouchableOpacity onPress={toggleItemsVisibility}>
            <Text style={styles.toggleButton}>
              {showItems ? "Hide Items" : "Show Items"}
            </Text>
          </TouchableOpacity>
        </View>
        {showItems && (
          <View style={styles.itemsContainer}>
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              ListHeaderComponent={() => (
                <View style={styles.itemRow}>
                  <Text style={[styles.itemText, styles.headerText]}>Name</Text>
                  <Text style={[styles.itemText, styles.headerText]}>Qty</Text>
                  <Text style={[styles.itemText, styles.headerText]}>
                    Price
                  </Text>
                  <Text style={[styles.itemText, styles.headerText]}>
                    Subtotal
                  </Text>
                </View>
              )}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
        <Button title="Create Invoice" onPress={handleSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  halfInput: {
    flex: 1,
    marginRight: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfContainer: {
    flex: 1,
    marginRight: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  toggleButton: {
    fontSize: 14,
    color: "#007bff",
    fontWeight: "600",
  },
  itemsContainer: {
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
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
