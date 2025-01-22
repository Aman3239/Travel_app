import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
const Place = ({ item, items, setItems, index }) => {

    const choosePlaces = name => {
        setItems(prevItems => {
            if (prevItems.includes(name)) {
                return prevItems.filter(item => item !== name);
            } else {
                return [...prevItems, name];
            }
        })
    }
    return (
        <Pressable onPress={() => choosePlaces(item?.name)}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 10 }}>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                        <View style={{ width: 30, height: 30, backgroundColor: "#0066b2", borderRadius: 25, justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ color: "white", fontWeight: "500" }}>{index + 1}</Text>
                        </View>
                        <Text numberOfLines={2} style={{ fontSize: 16, fontWeight: "500", width: "82%" }}>{item?.name}</Text>
                    </View>
                    <Text numberOfLines={3} style={{ color: "gray", marginTop: 7, width: "80%" }}>
                        {item?.briefDescription}
                    </Text>
                </View>
                <View>
                    <Image
                        style={{ width: 100, height: 100, borderRadius: 10, resizeMode: "cover" }}
                        source={{
                            uri: item?.photos[0]
                        }}
                    />
                </View>
            </View>
            <View>
                {items?.includes(item?.name) && (
                    <>
                        {item?.phoneNumber && (
                            <View style={{ marginHorizontal: 8, marginBottom: 6, padding: 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <AntDesign name="phone" size={23} color="#2a52be" />
                                <Text style={{ fontSize: 14, fontWeight: "500", color: "#4B61D1" }}>{item?.phoneNumber}</Text>
                            </View>
                        )}

                        <View style={{ marginHorizontal: 8, marginTop: 6, flexDirection: "row", alignItems: "center", padding: 1, gap: 10 }}>
                            <Ionicons name="time-outline" size={25} color="#2a52be" />
                            <Text style={{ fontSize: 14, fontWeight: "500", color: "#4B61D1" }}>Open {item?.openingHours[0].split(": ")[1]}</Text>
                        </View>

                        {item?.website && (
                            <View style={{ marginHorizontal: 8, marginTop: 8, marginBottom: 6, padding: 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <Ionicons name="earth" size={23} color="#2a52be" />
                                <Text style={{ fontSize: 14, fontWeight: "500", color: "#4B61D1" }}>{item?.website}</Text>
                            </View>
                        )}

                        {item?.formatted_address && (
                            <View style={{ marginHorizontal: 8, marginBottom: 6, padding: 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <Entypo name="location" size={23} color="#2a52be" />
                                <Text style={{ fontSize: 14, fontWeight: "500", color: "#4B61D1" }}>{item?.formatted_address}</Text>
                            </View>
                        )}

                    {item?.types && (
                        <View style={{marginHorizontal:8,marginBottom:6,marginTop:14,flexDirection:"row",alignItems:"center",gap:10,flexWrap:"wrap",padding:1}}>
                            {item?.types?.map((item,index)=>(
                                <View key={index} style={{paddingHorizontal:10,paddingVertical:7,borderRadius:25,backgroundColor:"#4B61D1"}}>
                                    <Text style={{textAlign:"center",color:"white",fontSize:13,fontWeight:"500"}}>{item}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                    </>
                )}

            </View>
        </Pressable>
    )
}

export default Place

const styles = StyleSheet.create({})