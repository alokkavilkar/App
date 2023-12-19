import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect } from "react";
import { Text, ToastAndroid, View } from "react-native";
import BleManager, { BleDisconnectPeripheralEvent, BleScanCallbackType, BleScanMatchMode, BleScanMode, Peripheral } from 'react-native-ble-manager'
import { NativeEventEmitter, NativeModules } from "react-native";
import { isLocationEnabled, promptForEnableLocationIfNeeded } from "react-native-android-location-enabler";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const ControlApp = ()=>{
    const isFocused = useIsFocused();
    console.log(isFocused);

    useEffect(()=>{
        if(isFocused)
        {
            const fetchData = async()=>{
                const val = await AsyncStorage.getItem("@app:id");
                console.log(val);

                if(val)
                {
                    const data = await BleManager.isPeripheralConnected(val);

                    console.log("Device is " + data);

                    if(data === false)
                    {
                        connect(val)
                    }
                    else{
                        console.log("Already connected.")
                    }
                }
            }
            fetchData();
        }
    }, [isFocused]);

    const getConnected = async () => {
        try {
            const devices = await BleManager.getConnectedPeripherals();
            console.log("In retrieve function ", devices);
        }
        catch (err) {
            console.log("Unable to get the connected devices..")
        }
    }
    function sleep(ms: number) {
        return new Promise<void>(resolve => setTimeout(resolve, ms));
    }
    const connect = async (peripheral: string) => {
        try {
            if (peripheral) {
                await BleManager.connect(peripheral);
                console.log('pheripheral connected.');
                ToastAndroid.show("Connected", ToastAndroid.SHORT);

                await sleep(900);

                const data = await BleManager.retrieveServices(peripheral);
                console.log("services: ", data);

                const rssi = await BleManager.readRSSI(peripheral);

                console.log("Rssi : " + rssi);

                if (data.characteristics) {
                    console.log("Present");
                }

                getConnected();

                if (data.characteristics) {
                    for (let characteristic of data.characteristics) {
                        if (characteristic.descriptors) {
                            for (let descriptor of characteristic.descriptors) {
                                try {
                                    let data = await BleManager.readDescriptor(
                                        peripheral,
                                        characteristic.service, characteristic.characteristic,
                                        descriptor.uuid
                                    );
                                    console.log("per", peripheral, " read as", data);
                                }
                                catch (err) {
                                    console.log("Don't able to get the data");
                                }
                            }
                        }
                    }
                }
            }
        }
        catch (err) {
            ToastAndroid.show("Disconnected check bluetooth connection", ToastAndroid.SHORT);
            console.log("Error occur..." + err);
        }
    }

    return(
        <View>
            <Text>Control App.</Text>
        </View>
    )
}

export default ControlApp;