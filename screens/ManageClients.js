import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { getClients, insertClient, deleteClient } from "../database/db";

export default function ManageClients({ navigation }) {
  const [clients, setClients] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState({ firstName: "", lastName: "" });

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

  // Validate name
  const validateName = (name) => {
    if (!name) return "Name is required";
    if (/\d/.test(name)) return "Name cannot contain numbers";
    return "";
  };

  // Handle add client
  const handleAddClient = async () => {
    const newErrors = {
      firstName: validateName(firstName),
      lastName: validateName(lastName),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error !== "")) {
      return;
    }

    try {
      await insertClient(firstName, lastName);
      setFirstName("");
      setLastName("");
      setErrors({ firstName: "", lastName: "" });
      await fetchClients();
      Alert.alert("Success", "Client added successfully!");
    } catch (error) {
      console.error("Failed to add client:", error);
      Alert.alert("Error", "Failed to add client. Please try again.");
    }
  };

  // Handle delete client
  const handleDeleteClient = (id, fullName) => {
    Alert.alert(
      "Delete Client",
      `Are you sure you want to delete ${fullName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteClient(id);
              await fetchClients();
              Alert.alert("Success", "Client deleted successfully!");
            } catch (error) {
              console.error("Failed to delete client:", error);
              Alert.alert(
                "Error",
                "Failed to delete client. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  // Render client item
  const renderClientItem = ({ item }) => {
    const fullName = `${item.first_name} ${item.last_name}`.trim();
    return (
      <View style={styles.clientItem}>
        <Text style={styles.clientName}>{fullName}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteClient(item.id, fullName)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

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
      <View style={styles.formContainer}>
        <Text style={styles.label}>Add Client</Text>
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                setErrors((prev) => ({
                  ...prev,
                  firstName: validateName(text),
                }));
              }}
              placeholder="First Name"
            />
            {errors.firstName ? (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            ) : (
              <Text style={[styles.errorText, styles.placeholder]}> </Text>
            )}
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                setErrors((prev) => ({
                  ...prev,
                  lastName: validateName(text),
                }));
              }}
              placeholder="Last Name"
            />
            {errors.lastName ? (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            ) : (
              <Text style={[styles.errorText, styles.placeholder]}> </Text>
            )}
          </View>
        </View>
        <Button title="Add Client" onPress={handleAddClient} />
      </View>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderClientItem}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No clients found. Add one!</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
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
  formContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  inputContainer: {
    flex: 1,
    marginRight: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 4,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    minHeight: 18,
  },
  placeholder: {
    color: "transparent",
  },
  clientItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  clientName: {
    fontSize: 16,
    color: "#333",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
