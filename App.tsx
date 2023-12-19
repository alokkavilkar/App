import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from "./Home";
import Control from "./Control";
import Guide from "./Guide";


const Tab = createBottomTabNavigator();

const App = ()=>{
  return(
    <NavigationContainer>
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarIconStyle:{display:"none"}}}>
        <Tab.Screen name='My Home'component={Home}/>
        <Tab.Screen name="Control" component={Control} />
        <Tab.Screen name="Guide" component={Guide} />
    </Tab.Navigator>
</NavigationContainer>
  )
}

export default App;