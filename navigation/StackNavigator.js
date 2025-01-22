import { StyleSheet, View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import HomeScreen from '../screens/HomeScreen';
import CreateTrip from '../screens/CreateTrip';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChooseImage from '../screens/ChooseImage';
import TripPlaneScreen from '../screens/TripPlaneScreen';
import LoginScreen from '../screens/LoginScreen';
import { AuthContext } from '../AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapScreen from '../screens/MapScreen';
import RegisterScreen from '../screens/RegisterScreen';

const StackNavigator = () => {
    const Stack = createNativeStackNavigator();

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const { token } = useContext(AuthContext)

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
                setIsAuthenticated(true)
            }
        };

        checkAuth();
    }, [])

    const AuthStack = () => {
        return (
            <Stack.Navigator>
                <Stack.Screen
                    name='Login'
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Register"
                    component={RegisterScreen}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        )
    };
    const MainStack = () => {
        return (
            <Stack.Navigator>
                <Stack.Screen
                    name='Home'
                    component={HomeScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name='Create'
                    component={CreateTrip}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name='Image'
                    component={ChooseImage}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name='Trip'
                    component={TripPlaneScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Map"
                    component={MapScreen}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        )
    }
    return (
        <NavigationContainer>
            {token ? <MainStack /> : <AuthStack />}
            {/* <MainStack/> */}
        </NavigationContainer>
    )
}

export default StackNavigator;

const styles = StyleSheet.create({})