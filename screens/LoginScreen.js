import { StyleSheet, Text, View, SafeAreaView, Image, Pressable, TextInput, KeyboardAvoidingView, Alert } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigation = useNavigation()
  const { token, setToken } = useContext(AuthContext)

  useEffect(() => {
    if (token){
        navigation.replace("MainStack", { Screen: "Main" })
    }
}, [token, navigation])
const handleLogin = () => {
    const user = {
        email: email,
        password: password,
    }

    axios.post("https://travel-app-tan-phi.vercel.app/login", user).then(response => {
        const token = response.data.token
        AsyncStorage.setItem("authToken", token);
        setToken(token)
        Alert.alert("Success", "You have Login successfully Please wait...");
    })
}
  return (
    <SafeAreaView>
      <View style={{ marginTop: 70 }}>
        <View style={{ flexDirection: "row", alignItems: "center", padding: 10, justifyContent: "center", borderColor: "#E0E0E0", margin: 12, borderWidth: 1, gap: 30, borderRadius: 25, marginTop: 20, position: "relative" }}>
          <AntDesign
            style={{ position: "absolute", left: 10 }}
            name="facebook-square"
            size={25}
            color="blue"
          />
          <Text style={{ flex: 1, textAlign: "center", fontSize: 15, fontWeight: "500" }}>Sign Up with Facebook</Text>
        </View>

        <Pressable
          onPress={""}
          style={{ flexDirection: "row", alignItems: "center", padding: 10, justifyContent: "center", borderColor: "#E0E0E0", margin: 12, borderWidth: 1, gap: 30, borderRadius: 25, marginTop: 20, position: "relative" }}>
          <AntDesign
            style={{ position: "absolute", left: 10 }}
            name="google"
            size={25}
            color="red"
          />
          <Text style={{ flex: 1, textAlign: "center", fontSize: 15, fontWeight: "500" }}>Sign Up with Google</Text>
        </Pressable>

        <View style={{ flexDirection: "row", alignItems: "center", padding: 10, justifyContent: "center", borderColor: "#E0E0E0", margin: 12, borderWidth: 1, gap: 30, borderRadius: 25, marginTop: 20, position: "relative" }}>
          <AntDesign
            style={{ position: "absolute", left: 10 }}
            name="mail"
            size={25}
            color="black"
          />
          <Text style={{ flex: 1, textAlign: "center", fontSize: 15, fontWeight: "500" }}>Sign Up with Email</Text>
        </View>

        <View style={{ marginTop: 10 }}>
          <Text style={{ textAlign: "center", fontSize: 20, fontWeight: "bold" }}>OR</Text>
        </View>
      </View>

      <KeyboardAvoidingView>
        <View style={{marginTop:10, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "500" }}>Login to your account</Text>
          <View style={{ marginTop: 30 }}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: "600", color: "gray" }}>Email :</Text>
              <View>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#BEBEBE"
                  style={{
                    width: 320,
                    marginTop: 15,
                    borderBottomColor: "#BEBEBE",
                    borderBottomWidth: 1,
                    paddingBottom: 10,
                    fontFamily: "GeezaPro-Bold",
                    fontSize: email ? 15 : 15
                  }}
                  placeholder='Enter your email'
                />
              </View>

              <Text style={{ fontSize: 18, fontWeight: "600", color: "gray", marginTop: 25 }}>Password :</Text>
              <View>
                <TextInput
                  secureTextEntry={true}
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor="#BEBEBE"
                  style={{
                    width: 320,
                    marginTop: 15,
                    borderBottomColor: "#BEBEBE",
                    borderBottomWidth: 1,
                    paddingBottom: 10,
                    fontFamily: "GeezaPro-Bold",
                    fontSize: email ? 15 : 15
                  }}
                  placeholder='Enter your password'
                />
              </View>
            </View>
          </View>
          <Pressable
            onPress={handleLogin}
            style={{
              width: 200, backgroundColor: "#4A55A2", padding: 15, marginTop: 50, marginLeft: "auto", marginRight: "auto", borderRadius: 6

            }}>
            <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", textAlign: "center" }}>Login</Text>
          </Pressable>

          <Pressable onPress={()=>navigation.navigate("Register")}>
            <Text style={{ textAlign: "center", color: "gray", fontSize: 16, margin: 12 }}>Don't have an account? Sign Up</Text>
          </Pressable>
        </View>


      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default LoginScreen

const styles = StyleSheet.create({})