import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InvoiceListScreen from "./screens/InvoiceListScreen";
import InvoiceFormScreen from "./screens/InvoiceFormScreen";
import { initializeDatabase } from "./database/db";

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    // Initialize the database when the app starts
    initializeDatabase().catch((error) => {
      console.error("Failed to initialize database:", error);
    });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="InvoiceList"
        screenOptions={{
          headerShown: false, // Hide default navigation bar
        }}
      >
        <Stack.Screen name="InvoiceList" component={InvoiceListScreen} />
        <Stack.Screen name="InvoiceForm" component={InvoiceFormScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
