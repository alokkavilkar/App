import React from "react";
import { Text, View } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeApp from "./HomeApp";

const HomeStack = createNativeStackNavigator();

const Home = ()=>{
    return(
        <HomeStack.Navigator initialRouteName="HomeApp">
            <HomeStack.Screen name="Home" options={{ headerTitleAlign: 'center' }} component={HomeApp} />
        </HomeStack.Navigator>
    )
}

export default Home;


