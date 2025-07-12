import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, Button } from "react-native";

export default function ClientForm({ initialClient, onSubmit, onCancel }) {
  const [firstName, setFirstName] = useState(initialClient?.first_name || "");
  const [lastName, setLastName] = useState(initialClient?.last_name || "");
  const [email, setEmail] = useState(initialClient?.email || "");
  const [phone, setPhone] = useState(initialClient?.phone || "");
  const [companyName, setCompanyName] = useState(
    initialClient?.company_name || ""
  );
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Validate inputs
  const validateName = (name) => {
    if (!name) return "Name is required";
    if (/\d/.test(name)) return "Name cannot contain numbers";
    return "";
  };

  const validateEmail = (email) => {
    if (!email) return "";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Invalid email format";
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone) return "";
    if (!/^\+?\d{7,15}$/.test(phone.replace(/\s/g, "")))
      return "Invalid phone number";
    return "";
  };

  // Handle form submission
  const handleSubmit = () => {
    const newErrors = {
      firstName: validateName(firstName),
      lastName: validateName(lastName),
      email: validateEmail(email),
      phone: validatePhone(phone),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error !== "")) {
      return;
    }

    onSubmit({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      company_name: companyName,
    });
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.label}>Client Details</Text>
      <View style={styles.row}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              setErrors((prev) => ({ ...prev, firstName: validateName(text) }));
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
              setErrors((prev) => ({ ...prev, lastName: validateName(text) }));
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
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErrors((prev) => ({ ...prev, email: validateEmail(text) }));
        }}
        placeholder="Email (optional)"
        keyboardType="email-address"
      />
      {errors.email ? (
        <Text style={styles.errorText}>{errors.email}</Text>
      ) : (
        <Text style={[styles.errorText, styles.placeholder]}> </Text>
      )}
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={(text) => {
          setPhone(text);
          setErrors((prev) => ({ ...prev, phone: validatePhone(text) }));
        }}
        placeholder="Phone (optional)"
        keyboardType="phone-pad"
      />
      {errors.phone ? (
        <Text style={styles.errorText}>{errors.phone}</Text>
      ) : (
        <Text style={[styles.errorText, styles.placeholder]}> </Text>
      )}
      <TextInput
        style={styles.input}
        value={companyName}
        onChangeText={setCompanyName}
        placeholder="Company Name (optional)"
      />
      <Text style={[styles.errorText, styles.placeholder]}> </Text>
      <View style={styles.buttonRow}>
        <Button title="Cancel" onPress={onCancel} color="#dc3545" />
        <Button
          title={initialClient ? "Update Client" : "Add Client"}
          onPress={handleSubmit}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
});
