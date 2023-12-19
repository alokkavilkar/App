import React from "react";
import BleManager, { BleDisconnectPeripheralEvent, BleScanCallbackType, BleScanMatchMode, BleScanMode, Peripheral } from 'react-native-ble-manager'
import { Alert, NativeEventEmitter, NativeModules } from "react-native";
import { FlatList, PermissionsAndroid, Platform, Text, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { isLocationEnabled, promptForEnableLocationIfNeeded } from "react-native-android-location-enabler";
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);


const App = ()=>{
  return(
    <View>

    </View>
  )
}

export default App;