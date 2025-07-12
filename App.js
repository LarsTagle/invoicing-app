import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import InvoiceListScreen from "./screens/InvoiceListScreen";
import InvoiceFormScreen from "./screens/InvoiceFormScreen";
import LandingPage from "./screens/LandingPage";
import { initializeDatabase } from "./database/db";

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
