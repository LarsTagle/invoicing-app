import React, { useState, useEffect, useCallback } from "react";
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
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { insertInvoice, insertItem, getClients } from "../database/db";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

export default function InvoiceFormScreen({ navigation }) {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [issueDate, setIssueDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [showItems, setShowItems] = useState(true);
  const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [errors, setErrors] = useState({
    client: "",
    issueDate: "",
    dueDate: "",
    itemName: "",
    itemQuantity: "",
    itemPrice: "",
  });

  const loadDeletedClientIds = async () => {
    try {
      const stored = await AsyncStorage.getItem("deletedClients");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load deleted client IDs:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getClients();
        const deletedIds = await loadDeletedClientIds();
        const filteredClients = data.filter(
          (client) => !deletedIds.includes(client.id)
        );
        setClients(filteredClients);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
        Alert.alert("Error", "Failed to load clients. Please try again.");
      }
    };
    fetchClients();
  }, []);

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const validateClient = (clientId) => {
    if (!clientId) return "Client is required";
    return "";
  };

  const validateIssueDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return "Issue date cannot be earlier than today";
    return "";
  };

  const validateDueDate = (due, issue) => {
    if (due < issue) return "Due date cannot be before issue date";
    return "";
  };

  const validateItem = (name, quantity, price) => {
    const errors = {};
    if (!name) errors.itemName = "Item name is required";
    else errors.itemName = "";
    if (!quantity) errors.itemQuantity = "Quantity is required";
    else if (isNaN(parseInt(quantity)) || parseInt(quantity) <= 0)
      errors.itemQuantity = "Quantity must be a positive number";
    else errors.itemQuantity = "";
    if (!price) errors.itemPrice = "Unit price is required";
    else if (isNaN(parseFloat(price)) || parseFloat(price) <= 0)
      errors.itemPrice = "Unit price must be a positive number";
    else errors.itemPrice = "";
    return errors;
  };

  const validateForm = () => {
    const selectedClient = clients.find(
      (c) => c.client_id === selectedClientId
    );
    const newErrors = {
      client: validateClient(selectedClientId),
      issueDate: validateIssueDate(issueDate),
      dueDate: validateDueDate(dueDate, issueDate),
      itemName: "",
      itemQuantity: "",
      itemPrice: "",
    };
    setErrors(newErrors);
    return (
      Object.values(newErrors).every((error) => error === "") &&
      items.length > 0
    );
  };

  const addItem = useCallback(() => {
    const itemErrors = validateItem(itemName, itemQuantity, itemPrice);
    setErrors((prev) => ({ ...prev, ...itemErrors }));
    if (Object.values(itemErrors).some((error) => error !== "")) {
      return;
    }
    const quantity = parseInt(itemQuantity);
    const price = parseFloat(itemPrice);
    setItems((prev) => [...prev, { name: itemName, quantity, price }]);
    setItemName("");
    setItemQuantity("");
    setItemPrice("");
  }, [itemName, itemQuantity, itemPrice]);

  const clearForm = useCallback(() => {
    setSelectedClientId("");
    setIssueDate(new Date());
    setDueDate(new Date());
    setItems([]);
    setItemName("");
    setItemQuantity("");
    setItemPrice("");
    setShowIssueDatePicker(false);
    setShowDueDatePicker(false);
    setShowItems(true);
    setErrors({
      client: "",
      issueDate: "",
      dueDate: "",
      itemName: "",
      itemQuantity: "",
      itemPrice: "",
    });
  }, []);

  const handleCancel = useCallback(() => {
    Alert.alert(
      "Cancel Invoice Creation",
      "Are you sure you want to cancel creating this invoice?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            clearForm();
            navigation.navigate("InvoiceList");
          },
        },
      ]
    );
  }, [clearForm, navigation]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      Alert.alert(
        "Error",
        "Please fix all validation errors before submitting."
      );
      return;
    }
    const selectedClient = clients.find(
      (c) => c.client_id === selectedClientId
    );
    try {
      const invoiceId = await insertInvoice(
        selectedClient.client_id,
        selectedClient.first_name,
        selectedClient.last_name,
        formatDate(issueDate),
        formatDate(dueDate),
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
    selectedClientId,
    clients,
    issueDate,
    dueDate,
    items,
    total,
    clearForm,
    navigation,
  ]);

  const toggleItemsVisibility = useCallback(() => {
    setShowItems((prev) => !prev);
  }, []);

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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("InvoiceList")}
        >
          <Ionicons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Invoice</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Client</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedClientId}
            style={styles.picker}
            onValueChange={(value) => {
              setSelectedClientId(value);
              setErrors((prev) => ({ ...prev, client: validateClient(value) }));
            }}
          >
            <Picker.Item label="Select Client" value="" />
            {clients.map((client) => (
              <Picker.Item
                key={client.client_id}
                label={`${client.client_id}: ${client.first_name} ${client.last_name}`}
                value={client.client_id}
              />
            ))}
          </Picker>
          {errors.client ? (
            <Text style={styles.errorText}>{errors.client}</Text>
          ) : (
            <Text style={[styles.errorText, styles.placeholder]}> </Text>
          )}
        </View>
        {selectedClientId && (
          <View style={styles.clientDetails}>
            {clients.find((c) => c.client_id === selectedClientId)?.email && (
              <Text style={styles.clientDetailText}>
                Email:{" "}
                {clients.find((c) => c.client_id === selectedClientId).email}
              </Text>
            )}
            {clients.find((c) => c.client_id === selectedClientId)?.phone && (
              <Text style={styles.clientDetailText}>
                Phone:{" "}
                {clients.find((c) => c.client_id === selectedClientId).phone}
              </Text>
            )}
            {clients.find((c) => c.client_id === selectedClientId)
              ?.company_name && (
              <Text style={styles.clientDetailText}>
                Company:{" "}
                {
                  clients.find((c) => c.client_id === selectedClientId)
                    .company_name
                }
              </Text>
            )}
          </View>
        )}
        <Text style={styles.label}>Dates</Text>
        <View style={styles.row}>
          <View style={styles.halfContainer}>
            <Text style={styles.subLabel}>Issue Date</Text>
            <TouchableOpacity
              style={[styles.dateButton, styles.dateButtonLeft]}
              onPress={() => setShowIssueDatePicker(true)}
            >
              <Text>{formatDate(issueDate)}</Text>
            </TouchableOpacity>
            {showIssueDatePicker && (
              <DateTimePicker
                value={issueDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowIssueDatePicker(false);
                  if (selectedDate) {
                    setIssueDate(selectedDate);
                    setErrors((prev) => ({
                      ...prev,
                      issueDate: validateIssueDate(selectedDate),
                      dueDate: validateDueDate(dueDate, selectedDate),
                    }));
                  }
                }}
              />
            )}
            {errors.issueDate ? (
              <Text style={styles.errorText}>{errors.issueDate}</Text>
            ) : (
              <Text style={[styles.errorText, styles.placeholder]}> </Text>
            )}
          </View>
          <View style={styles.halfContainer}>
            <Text style={styles.subLabel}>Due Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDueDatePicker(true)}
            >
              <Text>{formatDate(dueDate)}</Text>
            </TouchableOpacity>
            {showDueDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDueDatePicker(false);
                  if (selectedDate) {
                    setDueDate(selectedDate);
                    setErrors((prev) => ({
                      ...prev,
                      dueDate: validateDueDate(selectedDate, issueDate),
                    }));
                  }
                }}
              />
            )}
            {errors.dueDate ? (
              <Text style={styles.errorText}>{errors.dueDate}</Text>
            ) : (
              <Text style={[styles.errorText, styles.placeholder]}> </Text>
            )}
          </View>
        </View>
        <Text style={styles.label}>Add Item</Text>
        <View>
          <TextInput
            key="itemName"
            style={styles.input}
            value={itemName}
            onChangeText={(text) => {
              setItemName(text);
              setErrors((prev) => ({
                ...prev,
                itemName: text ? "" : "Item name is required",
              }));
            }}
            placeholder="Item name"
          />
          {errors.itemName ? (
            <Text style={styles.errorText}>{errors.itemName}</Text>
          ) : (
            <Text style={[styles.errorText, styles.placeholder]}> </Text>
          )}
        </View>
        <View style={styles.row}>
          <View style={styles.halfInputContainer}>
            <TextInput
              key="itemQuantity"
              style={[styles.input, styles.halfInput, styles.inputLeft]}
              value={itemQuantity}
              onChangeText={(text) => {
                setItemQuantity(text);
                const itemErrors = validateItem(itemName, text, itemPrice);
                setErrors((prev) => ({
                  ...prev,
                  itemQuantity: itemErrors.itemQuantity,
                }));
              }}
              placeholder="Quantity"
              keyboardType="numeric"
            />
            {errors.itemQuantity ? (
              <Text style={styles.errorText}>{errors.itemQuantity}</Text>
            ) : (
              <Text style={[styles.errorText, styles.placeholder]}> </Text>
            )}
          </View>
          <View style={styles.halfInputContainer}>
            <TextInput
              key="itemPrice"
              style={[styles.input, styles.halfInput]}
              value={itemPrice}
              onChangeText={(text) => {
                setItemPrice(text);
                const itemErrors = validateItem(itemName, itemQuantity, text);
                setErrors((prev) => ({
                  ...prev,
                  itemPrice: itemErrors.itemPrice,
                }));
              }}
              placeholder="Unit price"
              keyboardType="numeric"
            />
            {errors.itemPrice ? (
              <Text style={styles.errorText}>{errors.itemPrice}</Text>
            ) : (
              <Text style={[styles.errorText, styles.placeholder]}> </Text>
            )}
          </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  backButton: {
    paddingVertical: 8,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
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
  },
  inputLeft: {
    marginRight: 8,
  },
  halfInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfContainer: {
    flex: 1,
  },
  dateButtonLeft: {
    marginRight: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  picker: {
    width: "100%",
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
  errorText: {
    color: "red",
    fontSize: 12,
    minHeight: 18,
  },
  placeholder: {
    color: "transparent",
  },
  clientDetails: {
    marginBottom: 8,
  },
  clientDetailText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});
