import React, { useEffect, useState } from "react"
import { Alert, FlatList, PermissionsAndroid, Platform, Text, ToastAndroid, TouchableHighlight, TouchableOpacity, View } from "react-native"
import BleManager, { BleDisconnectPeripheralEvent, BleScanCallbackType, BleScanMatchMode, BleScanMode, Peripheral } from 'react-native-ble-manager'
import { NativeEventEmitter, NativeModules } from "react-native";
import { isLocationEnabled, promptForEnableLocationIfNeeded } from "react-native-android-location-enabler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);


const HomeApp = () => {

    // defining the state variables.
    const [isConnected, setConnected] = useState(false);
    const [BleLoc, setBleLoc] = useState(false);
    const [name, setName] = useState("");
    const [id, setId] = useState("");
    const [status, setStatus] = useState(false);

    const isFocused = useIsFocused();

    const [peripherals1, setPeripherals] = React.useState(
        new Map<Peripheral['id'], Peripheral>(),
    );

    const addOrUpdatePeripheral = (id: string, updatedPeripheral: Peripheral) => {
        setPeripherals(map => new Map(map.set(id, updatedPeripheral)));
    }




    useEffect(() => {
        BleManager.start({ showAlert: false });
        handlePermission();
        enableBLE();
        const ble1 = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
        console.log(Platform.Version);

        const fetchAsyncData = async () => {
            try {
                const val = await AsyncStorage.getItem('@app:id');
                console.log('Value is ', val);

                const valName = await AsyncStorage.getItem("@app:name");
                console.log("Name is " + name);
                
                if(valName) setName(valName);
                if(val) setId(val);

                if (val !== 'null' && val !== null && name !== "null") {
                    console.log(val);
                    console.log('Navigating Bro.....');
                    setConnected(true);
                    BleManager.isPeripheralConnected(val)
                        .then((conn) => {
                            console.log("Connected " + conn);

                            if(conn === false)
                            {
                                setStatus(true);
                                connect(val);
                            }
                            else{
                                setStatus(true)
                            }

                        })
                }
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        }

        fetchAsyncData();


        return () => {
            ble1.remove();
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

    const enableBLE = async () => {
        console.log("Ble is starting the connection.");
        try {
            await BleManager.enableBluetooth();
            console.log("Bluetooth enabled");
            setBleLoc(true);
            const checkEnabled: boolean = await isLocationEnabled();
            console.log("checkEnabled" + checkEnabled);
            if (checkEnabled === false) {
                await promptForEnableLocationIfNeeded().then((val) => {
                    console.log("Location enabled.");
                    setBleLoc(true);
                })
                    .catch((err) => {
                        console.log("Failed to to so...." + err);
                        setBleLoc(false);
                    })
            }
        }
        catch (error) {
            console.log("Error enabling bluetotth");
            Alert.alert(
                'Bluetooth permission required',
                'Please enable Bluetooth permission',
                [{ text: "Ok", onPress: () => console.log("Ok Pressed") }]
            )
        }

    }
    const startScan = () => {
        console.log(BleManager.checkState().then((state) => {
            console.log(state);
        }))
        setPeripherals(new Map<Peripheral['id'], Peripheral>());
        try {
            console.log("Scanning started");
            BleManager.scan([], 5, true, { matchMode: BleScanMatchMode.Sticky, scanMode: BleScanMode.LowLatency, callbackType: BleScanCallbackType.AllMatches })
                .then(() => {
                    console.log("Scanning succesfull");
                    // console.log(serivce_uid);
                })
                .catch((err) => {
                    console.log("Got erro while scanning.." + err);
                })
        }
        catch (error) {
            console.log("Scanning cannot be performed..." + error);
        }
    }

    const handleDiscoverPeripheral = async (peripheral: Peripheral) => {
        console.debug('[handleDiscoverPeripheral] new BLE peripheral= ', peripheral.name);

        if (!peripheral) {
            console.log("Please check with the location");
        }

        if (!peripheral.name) {
            peripheral.name = 'No Name';
        }
        else {
            // console.log("Peripherals" + peripheral.name);
            addOrUpdatePeripheral(peripheral.id, peripheral);
        }
    }

    const handlePermission = () => {
        if (Platform.OS === 'android' && Platform.Version >= 31) {
            PermissionsAndroid.requestMultiple(
                [
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                ]
            )
                .then(val => {
                    if (val) {
                        console.debug("Permission for android 12+ accepted.");
                    } else {
                        console.log("Permission denied by the user.");
                    }
                })
        }
        else if (Platform.OS == 'android' && Platform.Version >= 23) {
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,)
                .then((val) => {
                    if (val) {
                        console.log("User accepted permission");
                    }
                    else {
                        console.log("user denied the permission");
                    }
                })
        }

    }

    return (isConnected === false) ?
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>


            <TouchableOpacity
                style={{ width: '50%', backgroundColor: '#007bff', margin: 10, padding: 20, borderRadius: 20 }}
                onPress={startScan}
            >
                <Text style={{ color: "white", fontSize: 20, textAlign: 'center' }}>Scan</Text>
            </TouchableOpacity>

            <FlatList style={{ width: '90%' }}
                data={Array.from(peripherals1.values())}
                contentContainerStyle={{ rowGap: 12 }}
                keyExtractor={item => item.id}
                renderItem={item => (
                    <TouchableHighlight
                        style={{ backgroundColor: 'lightgrey', borderRadius: 20 }}
                        underlayColor="#90EE90"
                        onPress={() => {

                            if (item.item.id) {
                                console.log("Data stored finally");
                                AsyncStorage.setItem("@app:id", item.item.id);
                            }

                            if (item.item.name) {
                                console.log("Name stored");
                                console.log(item.item.name);
                                AsyncStorage.setItem("@app:name", item.item.name);
                                connect(item.item.id);
                                setConnected(true)
                            }

                        }}>
                        <View style={{ padding: 20 }}>
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 20 }}>{item.item.advertising?.localName}</Text>
                                <Text style={{ fontSize: 20 }}>{item.item.rssi}</Text>
                            </View>
                            <Text style={{ fontSize: 15 }}>{item.item.id}</Text>
                        </View>
                    </TouchableHighlight>
                )}
            />
        </View>
        :
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'cursive', fontSize: 30 }}>Welcome 👋</Text>
            <Text>Paired</Text>
            <View style={{ flexDirection: 'row', margin: 20 }}>
                <Text>{name}</Text>
                {(status) ? <Text> ✅  </Text> : <Text> ❌</Text>}
            </View>
            <TouchableOpacity style={{margin:20, padding:'5%', backgroundColor:'lightred', borderRadius:10}}
                onPress={()=>{
                    BleManager.disconnect(id)
                    .then((val)=>{
                        console.log(val);
                        setStatus(false);
                        setConnected(false);
                        setId("");
                        setName("");
                        AsyncStorage.setItem("@app:id", "null");
                        AsyncStorage.setItem("@app:name", "null");
                    })
                }}
            >
                <Text style={{color:'white'}}>Unpair</Text>
            </TouchableOpacity>
        </View>
}

export default HomeApp;