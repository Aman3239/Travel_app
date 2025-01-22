import { StyleSheet, Text, View, SafeAreaView, Image } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useRoute } from '@react-navigation/native'
import MapView, { Circle, Marker } from 'react-native-maps'

import Entypo from 'react-native-vector-icons/Entypo';

const MapScreen = () => {
    const route = useRoute()
    const mapView = useRef(null)
    const places = route?.params?.places;
    const firstPlace = places[0];

    const coordinates = places?.map(place => ({
        latitude: place?.geometry.location.lat,
        longitude: place?.geometry.location.lng,
    }));

    useEffect(() => {
        if (places && mapView.current) {
            mapView.current.fitToCoordinates(coordinates, {
                edgePadding: {
                    top: 50, right: 50, bottom: 50, left: 50,
                }
            })
        }
    }, [places])

    const [selectedMarker, setSelectedMarker] = useState(null)
    return (
        <SafeAreaView>
            <MapView initialRegion={{
                latitude: firstPlace.geometry.location.lat,
                longitude: firstPlace.geometry.location.lng,
                latitudeDelta: 0.04,
                longitudeDelta: 0.04
            }}
                style={{ width: "100%", height: "100%", marginTop: 20, borderRadius: 5 }}
                ref={mapView}>
                {route?.params?.places?.map((item, index) => (
                    <Marker
                        onPress={() => setSelectedMarker(item)}
                        title={item?.name}
                        description={item?.briefDescription}
                        coordinate={{
                            latitude: item.geometry.location.lat,
                            longitude: item.geometry.location.lng,
                        }}>

                    </Marker>
                ))}
                <View style={{padding:10,backgroundColor:selectedMarker ? "white" : "transparent",borderRadius:7,marginTop:"auto",marginBottom:30,marginHorizontal:30}}>
                    {selectedMarker && (
                        <View style={{ padding: 5, backgroundColor: "white", borderTopLeftRadius: 10, borderTopRightRadius: 10, elevation: 5 }}>
                            <View style={{flexDirection:"row",alignItems:"center",marginBottom:10}}>
                                <View style={{ width: 30, height: 30, backgroundColor: "#0066b2", borderRadius: 25, justifyContent: "center", alignItems: "center" }}>
                                    <Text style={{color:"white",fontWeight:"500"}}>{1}</Text>
                                </View>
                                <Text style={{ fontSize: 16, fontWeight: "500", width: "82%", flex: 1,marginLeft:8 }}>{selectedMarker.name}</Text>
                                <Entypo
                                    onPress={() => setSelectedMarker(null)}
                                    name="cross"
                                    size={25}
                                    color="gray"
                                />
                            </View>
                            <Text numberOfLines={3}
                                style={{ color: "gray", marginBottom: 10 }}
                            >
                                {selectedMarker?.briefDescription}
                            </Text>

                            {selectedMarker.photos && selectedMarker.photos[0] && (
                                <Image
                                    source={{ uri: selectedMarker.photos[0] }}
                                    style={{ width: '100%', height: 150, borderRadius: 10, marginBottom: 10 }}
                                    resizeMode='cover'
                                />
                            )}
                        </View>
                    )}
                </View>
            </MapView>
        </SafeAreaView>
    )
}

export default MapScreen

const styles = StyleSheet.create({})