import { StyleSheet, Text, View, SafeAreaView, ScrollView, Image, Pressable, ImageBackground } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import "core-js/stable/atob"
import { AuthContext } from '../AuthContext';
import { Object } from 'core-js';

const HomeScreen = () => {
  const currentYear = moment().year();
  const Navigation = useNavigation();
  const [trips, setTrips] = useState([]);
  const [user, setUser] = useState(null)
  const { userId, setUserId, setToken, token } = useContext(AuthContext)


  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('authToken');
      const decodeToken = jwtDecode(token);
      const userId = decodeToken.userId;
      setUserId(userId)
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTrips();
    }
  }, [userId])
  const fetchTrips = async () => {
    try {
      console.log('userdata', userId)
      const response = await axios.get(`https://travel-app-tan-phi.vercel.app/trips/${userId}`);
      setTrips(response.data)
    } catch (error) {
      console.log("Error fetching trips:", error)
    }
  }
  console.log("Trips", trips)

  const logout = () => {
    clearAuthToken();
  }
  const clearAuthToken = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      setToken('');
    } catch (error) {
      console.log("Error", error)
    }
  }

  return (
    <SafeAreaView>
      <ScrollView style={{}}>
        <View style={{ padding: 11, flexDirection: 'row', alignItems: "center", justifyContent: "space-between" }}>
          <Icon onPress={logout} name="user" size={30} color="orange" />

          <View style={{ flexDirection: "row", alignItems: "center", gap: "10" }}>
            <AntDesign name="search1" size={30} color="orange" />
            <Pressable onPress={() => Navigation.navigate("Create")}>

              <AntDesign name="plus" size={30} color="orange" />
            </Pressable>
          </View>
        </View>
        <View style={{ padding: 10 }}>
          <Text style={{ fontSize: 25, fontWeight: "bold" }}>My Trips</Text>

          <Text style={{ marginTop: 6, fontSize: 19, fontWeight: "600", color: "orange" }}>{currentYear}</Text>
        </View>

        <View>
          {
            Array.isArray(trips) && trips.map((item, index) => (
              <Pressable onPress={() => Navigation.navigate("Trip", {
                item: item,
              })} key={index} style={{ padding: 15 }}>
                <ImageBackground
                  imageStyle={{ borderRadius: 10 }}
                  style={{ width: '100%', height: 220 }} source={{ uri: item?.background }}>
                  <View style={{ padding: 15 }}>
                    <Text style={{ fontSize: 18, color: "white", fontWeight: "bold" }}>
                      {item?.startDate} - {item?.endDate}
                    </Text>
                    <Text style={{ marginTop: 10, fontSize: 19, fontWeight: "bold", color: "white" }}>{item?.tripName}</Text>
                  </View>
                </ImageBackground>
              </Pressable>
            ))
          }
        </View>

        <View style={{padding: 10}}>
          <Image
            style={{
              width: '96%',
              height: 220,
              resizeMode: 'contain',
              alignSelf: 'center',
              borderRadius: 20,
            }}
            source={{
              uri: 'https://tripsy.blog/content/images/size/w1000/2023/03/Tripsy-2.15-Cover-2.jpg',
            }}
          />
        </View>

        <View style={{ marginTop: 20, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 17, fontWeight: "600", textAlign: "center" }} >Organize your next trip!</Text>
          <Text style={{ marginTop: 15, color: "gray", fontSize: 16, width: 300, textAlign: "center" }}>Create your next trip and plan the activities of your itinrary</Text>
        </View>

        <Pressable onPress={() => Navigation.navigate("Create")}
          style={{ marginTop: 30, backgroundColor: "#383838", padding: 14, width: 200, borderRadius: 25, marginLeft: "auto", marginRight: "auto" }}>
          <Text style={{ textAlign: "center", color: "white", fontSize: 16, fontWeight: "600" }}>Create a Trip</Text>
        </Pressable>
        <View style={{ padding: 10, borderRadius: 10 }}>
          <Image
            style={{ width: "100%", height: 300, marginTop: 10, alignSelf: "center" ,borderRadius:8}}
            source={{
              uri: "https://practicalwanderlust.com/wp-content/uploads/2018/11/Lia-and-Jeremy-at-Yosemite-National-Park-Chapel.jpg"
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default HomeScreen

const styles = StyleSheet.create({})  