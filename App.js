import React, { useEffect, useState } from "react";
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
import Login from "./screens/Login";

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState("Login");

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
        if (isLoggedIn === "true") {
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

          setInitialRoute("LandingPage");
        }
      } catch (error) {
        console.error("Failed to check login status:", error);
      }
    };
    checkLoginStatus();
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="LandingPage" component={LandingPage} />
        <Stack.Screen name="ManageClients" component={ManageClients} />
        <Stack.Screen name="CreateClient" component={CreateClient} />
        <Stack.Screen name="EditClient" component={EditClient} />
        <Stack.Screen name="ViewClients" component={ViewClients} />
        <Stack.Screen name="InvoiceList" component={InvoiceListScreen} />
        <Stack.Screen name="InvoiceForm" component={InvoiceFormScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
