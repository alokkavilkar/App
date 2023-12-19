import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Text, View } from "react-native";
import ControlApp from "./ControlApp";


const ControlStack = createNativeStackNavigator();

const Control = () => {
    
    return (
        <ControlStack.Navigator initialRouteName="HomeApp">
            <ControlStack.Screen name="Watch Control" options={{ headerTitleAlign: 'center' }} component={ControlApp} />
        </ControlStack.Navigator>
    )
}

export default Control;