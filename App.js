import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import InvoiceListScreen from "./screens/InvoiceListScreen";
import InvoiceFormScreen from "./screens/InvoiceFormScreen";
import LandingPage from "./screens/LandingPage";
import ManageClients from "./screens/ManageClients";
import CreateClient from "./screens/CreateClient";
import EditClient from "./screens/EditClient";
import ViewClients from "./screens/ViewClients";
import { initializeDatabase, clearDatabase } from "./database/db";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    // for clearing the database and AsyncStorage
    // const resetDatabase = async () => {
    //   try {
    //     // Clear AsyncStorage for deletedClients
    //     await AsyncStorage.removeItem("deletedClients");
    //     // Clear and reinitialize the database
    //     await clearDatabase();
    //     await initializeDatabase();
    //   } catch (error) {
    //     console.error("Failed to reset database or AsyncStorage:", error);
    //   }
    // };
    // resetDatabase();
    initializeDatabase();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LandingPage">
        <Stack.Screen
          name="LandingPage"
          component={LandingPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="InvoiceList"
          component={InvoiceListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="InvoiceForm"
          component={InvoiceFormScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ManageClients"
          component={ManageClients}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateClient"
          component={CreateClient}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditClient"
          component={EditClient}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ViewClients"
          component={ViewClients}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
