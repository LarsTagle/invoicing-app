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
        <View style={[styles.inputContainer, styles.rowInputContainer]}>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              setErrors((prev) => ({ ...prev, firstName: validateName(text) }));
            }}
            placeholder="First Name"
          />
          {errors.firstName && (
            <Text style={styles.errorText}>{errors.firstName}</Text>
          )}
        </View>
        <View style={[styles.inputContainer, styles.rowInputContainer]}>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              setErrors((prev) => ({ ...prev, lastName: validateName(text) }));
            }}
            placeholder="Last Name"
          />
          {errors.lastName && (
            <Text style={styles.errorText}>{errors.lastName}</Text>
          )}
        </View>
      </View>
      <View style={styles.inputContainer}>
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
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>
      <View style={styles.inputContainer}>
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
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="Company Name (optional)"
        />
      </View>
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
    padding: 24, // Increased for more internal space
    borderRadius: 4,
    marginTop: 16, // Increased from 10 for more space above
    marginHorizontal: 16,
    marginBottom: 24, // Increased from 16 for more space below
    borderWidth: 1,
    borderColor: "#ccc",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12, // Increased for more space below label
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between", // Ensures even spacing for First Name and Last Name
    marginBottom: 16, // Increased for vertical spacing
  },
  inputContainer: {
    flex: 1, // Ensures inputs take available space
    marginBottom: 16, // Increased to account for removed placeholder space
    width: "100%", // Ensures full width for non-row inputs
  },
  rowInputContainer: {
    marginRight: 12, // Increased for space between First Name and Last Name
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 12, // Increased for better internal spacing
    marginBottom: 8, // Increased for space below input
    height: 40, // Explicit height for consistent sizing
    width: "100%", // Ensures full width for all inputs
  },
  errorText: {
    color: "red",
    fontSize: 12,
    minHeight: 18, // Maintains consistent height for error messages
    marginTop: 4, // Separates error text from input
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16, // Increased for more space above buttons
    paddingHorizontal: 16, // Prevents buttons from touching edges
  },
});
