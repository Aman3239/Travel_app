import { StyleSheet, Text, View, SafeAreaView, ScrollView, Image, Pressable, TextInput, Alert } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment';
import BottomModals, { Modal, ModalContent, ModalTitle, SlideAnimation } from 'react-native-modals'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import 'react-native-get-random-values'
import axios from 'axios'
import Place from '../components/Place';

const TripPlaneScreen = () => {
    const route = useRoute();
    const [option, setOption] = useState("Overview")
    const [places, setPlaces] = useState([]);
    const navigation = useNavigation()
    const formateDate = (date) => {
        return moment(date).format("D MMMM")
    };

    const tripId = route.params?.item?._id;

    const tripName = route?.params?.item?.tripName;
    const senderName = route?.params?.item?.name;

    const [recommendedPlaces, setRecommendedPlaces] = useState([])
    const [placeDatails, setPlacesDetails] = useState([])
    const [selectedDate, setSelectedDate] = useState("")
    const [modalVisible, setModalVisible] = useState(false)
    const [items, setItems] = useState([]);
    const [itinerary, setItinerary] = useState([])
    const [modelOpen, setModelOpen] = useState(false);
    const [budget, setBudget] = useState(0)
    const [modal, setModal] = useState(false)
    const [modalView, setModalView] = useState("original")
    const [price, setPrice] = useState(0)
    const [category, setCategory] = useState("")
    const [image, setImage] = useState('')
    const [value, setValue] = useState('')
    const [paidBy, setPaidBy] = useState('')
    const [openShareModal, setOpneShareModal] = useState(false)
    const [email, setEmail] = useState("")
    const [isValidEmail, setIsValidEmail] = useState(false)

    const fetchPlaceDetails = async (placeId) => {
        console.log("hay")
        try {
            const response = await axios.post(`https://travel-app-tan-phi.vercel.app/trip/${tripId}/addPlace`, {
                placeId: placeId,
            })

            console.log("updated trip", response.data)

            if (response.status === 200) {
                setModalVisible(false);
            }
        } catch (error) {
            console.log("Error", error)
        }
    }


    const fetchPlacesToVisit = async () => {
        try {
            const response = await axios.get(`https://travel-app-tan-phi.vercel.app/trip/${tripId}/placesToVisit`)
            const placesToVisit = response.data
            console.log("Places to visit", placesToVisit)
            setPlaces(placesToVisit)
        } catch (error) {
            console.log("Error", error)
        }
    }


    useEffect(() => {
        fetchPlacesToVisit();
    }, [])

    useFocusEffect(
        useCallback(() => {
            fetchPlacesToVisit()
        }, [modalVisible])
    )

    useEffect(() => {
        const fetchRecomendedPlaces = async () => {
            try {
                const response = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
                    {
                        params: {
                            location: '12.2958,76.6394',//lattitude and longitude of mysore
                            radius: 5000,//5km radius
                            type: "tourist_attraction",
                            key: "AIzaSyCOuBbjFnjq1tZEWLftoILe6CKLzM_2lLc"
                        },
                    },
                )

                setRecommendedPlaces(response.data.results.slice(0, 10));
            } catch (error) {
                console.log("Error fetching the places", error)
            }
        }

        fetchRecomendedPlaces()
    }, [])

    const fetchDetails = async (placeId) => {
        const API_KEY = "AIzaSyCOuBbjFnjq1tZEWLftoILe6CKLzM_2lLc"
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`;

        try {
            const response = await axios.get(url);
            const details = response.data.result;

            console.log("Places Details", details);
            return details;
        } catch (error) {
            console.log("Error fetching place details", error)
        }
    }

    const fetchAllPlacesDetails = async () => {
        const detailsPromises = recommendedPlaces.slice(0, 10).map(place => fetchDetails(place.place_id));
        const fetchedDetails = await Promise.all(detailsPromises);

        const validDetails = fetchedDetails.filter(details => details !== null);

        setPlacesDetails(validDetails);
    }
    useEffect(() => {
        if (recommendedPlaces.length > 0) {
            fetchAllPlacesDetails()
        }
    }, [])

    const setOpenModal = item => {
        setSelectedDate(item?.date);

        setModalVisible(true)
    }

    useEffect(() => {
        fetchItinerary();
    }, [modalVisible])

    const fetchItinerary = async () => {
        try {
            const response = await axios.get(`https://travel-app-tan-phi.vercel.app/trip/${tripId}/itinerary`)

            const itinerary = response.data;

            setItinerary(itinerary);
        } catch (error) {
            console.log("Error", error)
        }
    }

    const setTripBudget = async budget => {
        console.log('budget', budget)
        try {
            const response = axios.put(`https://travel-app-tan-phi.vercel.app/setBudget/${tripId}`, {
                budget
            },);
            setModelOpen(false)
            console.log("Budget", response.data)
        } catch (error) {
            console.log("Error", error)
        }
    }

    const addPlaceToItinerary = async (place) => {
        if (!selectedDate || !tripId) {
            console.error("Selected date or trip ID is missing");
            return;
        }

        const newActivity = {
            date: selectedDate,
            name: place.name,
            phoneNumber: place.phoneNumber,
            website: place.website,
            openingHours: place.openingHours,
            photos: place.photos,
            reviews: place.reviews,
            briefDescription: place.briefDescription,
            geometry: {
                location: {
                    lat: place.geometry?.location?.lat,
                    lng: place.geometry?.location?.lng,
                },
                viewport: {
                    northeast: {
                        lat: place.geometry?.viewport?.northeast?.lat,
                        lng: place.geometry?.viewport?.northeast?.lng,
                    },
                    southwest: {
                        lat: place.geometry?.viewport?.southwest?.lat,
                        lng: place.geometry?.viewport?.southwest?.lng,
                    },
                },
            },
        };

        try {
            const response = await axios.post(
                `https://travel-app-tan-phi.vercel.app/trips/${tripId}/itinerary/${selectedDate}`,
                newActivity
            );

            console.log("Activity added", response.data);
            setModalVisible(false);
        } catch (error) {
            console.error("Error adding activity:", error);
        }
    };

    const goToBlankView = () => {
        setModalView("blank");
    }

    const goToOriginalView = () => setModalView("original")


    const data = [
        {
            id: '0',
            name: 'Flights',
            image:
                'https://t3.ftcdn.net/jpg/02/58/40/90/240_F_258409001_w0gCLGQ5pFdJEyNB8KiiNrijHCGSdUpQ.jpg',
        },
        {
            id: '2',
            name: 'Lodges',
            image:
                'https://t3.ftcdn.net/jpg/02/21/73/46/240_F_221734695_OLItP2OWAkRqBLol8esvA4a9PuTV5pgK.jpg',
        },
        {
            id: '3',
            name: 'Car Rental',
            image:
                'https://t3.ftcdn.net/jpg/01/92/21/40/240_F_192214085_QnQ58x0ZKRLSUEgarcjVHNWrnmH8uWTA.jpg',
        },
        {
            id: '4',
            name: 'Food',
            image:
                'https://t3.ftcdn.net/jpg/00/81/02/86/240_F_81028652_e31aujidvR7NAtA8Cl4VxjDUJFUeAFte.jpg',
        },
        {
            id: '5',
            name: 'Activities',
            image:
                'https://t4.ftcdn.net/jpg/02/64/91/73/240_F_264917306_HnNaVViUQshIGnOGm1LA2FuE4YhTdu1l.jpg',
        },
        {
            id: '6',
            name: 'Shopping',
            image: 'https://cdn-icons-png.flaticon.com/128/2838/2838694.png',
        },
        {
            id: '9',
            name: 'Tour',
            image:
                'https://t3.ftcdn.net/jpg/08/37/58/92/240_F_837589252_QQfYmY2md3yunH4jRARAi6uNVf9yap53.jpg',
        },
        {
            id: '7',
            name: 'Petrol',
            image:
                'https://media.istockphoto.com/id/925225820/vector/gas-station-icon.jpg?b=1&s=612x612&w=is&k=20&c=w6pmbKjeR0z637e5fKhlDWGOJP6dgrafypC6tUI6LxM=',
        },
        {
            id: '8',
            name: 'Other',
            image:
                'https://t3.ftcdn.net/jpg/02/73/79/70/240_F_273797075_lqtsBJvUc9QsulXvIexCUHGLJWntTOL5.jpg',
        },
    ];

    const selectCategory = item => {
        setCategory(item?.name);
        setImage(item?.image);
        setModalView("original")
    }

    const [isPaidByExpanded, setIsPaidByExpanded] = useState(false)
    const [isSplitByExpanded, setIsSplitByExpanded] = useState(false)
    const toggleSplit = () => {
        setIsSplitByExpanded(!isSplitByExpanded)
    }
    const togglePaidBy = () => setIsPaidByExpanded(!isPaidByExpanded);

    const addExpenseToTrip = async () => {
        try {
            const expenseData = {
                category: category,
                price: price,
                splitBy: value,
                paidBy: paidBy
            };

            const response = await axios.post(`https://travel-app-tan-phi.vercel.app/addExpense/${tripId}`, expenseData);

            if (response.status === 200) {
                console.log("expense Added successfully:", response.data)
                Alert.alert("Success", "Expenses added successfully");
                setModal(!modal);
            }
            else {
                console.error('Failed to add expense:', response.data.message);
            }

        } catch (error) {
            console.log("Error adding expense", error)
        }
    }

    useEffect(() => {
        fetchExpenses();
    }, [modal])

    const [expenses, setExpenses] = useState([])
    const fetchExpenses = async () => {
        try {
            const response = await axios.get(`https://travel-app-tan-phi.vercel.app/getExpenses/${tripId}`)
            if (response.status === 200) {
                setExpenses(response.data.expenses)
            }
        } catch (error) {
            console.log("Error", error)
        }
    }


    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    const handleEmailChange = (input) => {
        setEmail(input);
        setIsValidEmail(validateEmail(input))
    }

    console.log("Expenses", expenses)

    const handleSendInvite = async () => {
        try {
            if (isValidEmail) {
                const response = await axios.post('https://travel-app-tan-phi.vercel.app/sendInviteEmail', {
                    email,
                    tripId,
                    tripName,
                    senderName,
                })
                if (response.status === 200) {
                    console.log("Invite send successfully");
                    Alert.alert("Success", "Invite send successfully");
                    setOpneShareModal(false);
                }
            }
        } catch (error) {
            console.log("Error", error)
        }
    }
    return (
        <>
            <SafeAreaView>
                <ScrollView>
                    <View>
                        <Image
                            style={{ width: "100%", height: 200, resizeMode: 'cover' }}
                            source={{
                                uri: "https://www.globetrove.com/wp-content/uploads/2018/08/Mysore-Palace.jpg.webp"
                            }}
                        />
                        <View>
                            <View>
                                <Pressable style={{
                                    padding: 20, backgroundColor: "white", width: 300, marginLeft: "auto", marginRight: "auto", borderRadius: 10, position: "absolute", top: -100, left: "50%", transform: [{ translateX: -150 }],
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    elevation: 5
                                }}>
                                    <Text numberOfLines={1} style={{ textAlign: "left", fontSize: 22, fontWeight: "bold" }}>
                                        Trip To {route?.params?.item?.tripName}
                                    </Text>
                                    <View style={{ marginTop: 4 }}>
                                        <View>
                                            <Text style={{ fontWeight: "500" }}>{route?.params?.item?.startDate} -{' '}
                                                {route?.params?.item?.endDate}
                                            </Text>
                                            <Text style={{ marginTop: 4, color: "gray", }}>{route?.params?.item?.startDay} -{' '}
                                                {route?.params?.item?.endDay}
                                            </Text>
                                        </View>
                                        <View style={{ marginTop: 8 }}>
                                            <View style={{
                                                flexDirection: "row", alignItems: "center",
                                                gap: 10
                                            }}>
                                                <Image style={{ width: 34, height: 34, borderRadius: 17 }} source={{ uri: "https://lh3.googleusercontent.com/ogw/AF2bZyjAblSUK2UCzLcJccIxE4lN23n1uZK6jkze9M3KZsnyNwE=s32-c-mo" }} />

                                                <Pressable onPress={() => setOpneShareModal(!openShareModal)} style={{
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 8,
                                                    borderRadius: 25,
                                                    alignSelf: "flex-start",
                                                    backgroundColor: "black"
                                                }}>
                                                    <Text style={{
                                                        textAlign: "center",
                                                        color: "white",
                                                        fontSize: 12,
                                                        fontWeight: "500"
                                                    }}>
                                                        Share
                                                    </Text>
                                                </Pressable>
                                            </View>

                                        </View>
                                    </View>
                                </Pressable>
                                <View style={{ backgroundColor: "white", height: 80, zIndex: -100 }} />
                                <View style={{
                                    flexDirection: "row", alignItems: "center", gap: 25, justifyContent: "space-around", backgroundColor: "white", padding: 12
                                }}>
                                    <Pressable onPress={() => setOption("Overview")}>
                                        <Text style={{ fontSize: 16, fontWeight: "500", color: option == "Overview" ? "#ed6509" : "gray" }}>Overview</Text>
                                    </Pressable>

                                    <Pressable onPress={() => setOption("Itinerary")}>
                                        <Text style={{ fontSize: 16, fontWeight: "500", color: option == "Itinerary" ? "#ed6509" : "gray" }}>Itinerary</Text>
                                    </Pressable>

                                    <Pressable onPress={() => setOption("Explore")}>
                                        <Text style={{ fontSize: 16, fontWeight: "500", color: option == "Explore" ? "#ed6509" : "gray" }}>Explore</Text>
                                    </Pressable>

                                    <Pressable onPress={() => setOption("$")}>
                                        <Text style={{ fontSize: 16, fontWeight: "500", color: option == "$" ? "#ed6509" : "gray" }}>$</Text>
                                    </Pressable>
                                </View>

                                <View>
                                    {option == "Overview" && (
                                        <ScrollView style={{ marginTop: 15, borderRadius: 10 }}>
                                            <View style={{ backgroundColor: "white", padding: 12 }}>
                                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                                        <MaterialIcons name="keyboard-arrow-down" size={25} color="black" />
                                                        <Text style={{ fontSize: 15, fontWeight: "bold" }}>Notes</Text>
                                                    </View>
                                                    <MaterialCommunityIcons name="dots-horizontal" size={25} color="gray" />
                                                </View>
                                                <View style={{ marginTop: 10 }}>
                                                    <Text style={{ fontWeight: '500', fontStyle: "italic", color: "gray" }}>Write or paste general notes here, e.g how to get</Text>
                                                </View>
                                            </View>
                                            <View style={{ padding: 12, backgroundColor: "white", marginVertical: 15 }}>
                                                <View style={{ flexDirection: "row", padding: 1, alignItems: "center", justifyContent: "space-between" }}>
                                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                                        <MaterialIcons name="keyboard-arrow-down" size={25} color="black" />
                                                        <Text style={{ fontSize: 15, fontWeight: "bold" }}>Places to Visit</Text>
                                                    </View>
                                                    <MaterialCommunityIcons name="dots-horizontal" size={25} color="gray" />
                                                </View>

                                                <View>
                                                    {places && places?.map((item, index) => (
                                                        <Place index={index} item={item} items={items} setItems={setItems} />
                                                    ))}
                                                </View>

                                                <View style={{
                                                    marginTop: 10,
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    gap: 10
                                                }}>
                                                    <Pressable onPress={() => setModalVisible(!modalVisible)} style={{
                                                        padding: 6,
                                                        borderRadius: 10,
                                                        backgroundColor: '#F0F0F0',
                                                        flexDirection: "row",
                                                        alignItems: "center",
                                                        gap: 5,
                                                        flex: 1
                                                    }}>
                                                        <MaterialIcons
                                                            name="location-pin"
                                                            size={25}
                                                            color="gray"
                                                        />
                                                        <TextInput
                                                            placeholder='Add a place'
                                                        />
                                                    </Pressable>
                                                    <View style={{
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: 25,
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        backgroundColor: "#F0F0F0"
                                                    }}>
                                                        <MaterialIcons
                                                            name="attach-file"
                                                            size={25}
                                                            color="black"
                                                        />
                                                    </View>
                                                    <View style={{
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: 25,
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        backgroundColor: "#F0F0F0"
                                                    }}>
                                                        <MaterialCommunityIcons
                                                            name="map-check-outline"
                                                            size={25}
                                                            color="black"
                                                        />
                                                    </View>
                                                </View>
                                                <Text style={{ fontSize: 15, fontWeight: "500", marginLeft: 10, marginTop: 15 }}>Recommended Places</Text>

                                                <View style={{ marginHorizontal: 10, marginVertical: 15 }}>
                                                    {placeDatails && (
                                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                            {placeDatails?.map((item, index) => {
                                                                const firstPhoto = item?.photos[0];
                                                                const imageUrl = firstPhoto ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${firstPhoto.photo_reference}&key=AIzaSyCOuBbjFnjq1tZEWLftoILe6CKLzM_2lLc`
                                                                    : null;

                                                                return (
                                                                    <Pressable style={{ flexDirection: "row", alignItems: "center", marginRight: 12, borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 8, padding: 10, marginBottom: 10, height: 100, overflow: "hidden" }}>
                                                                        <View style={{ marginRight: 10 }}>
                                                                            {
                                                                                imageUrl ? (
                                                                                    <Image style={{ width: 80, height: 80, borderRadius: 6, resizeMode: "cover" }} source={{ uri: imageUrl }} />
                                                                                ) : (
                                                                                    <Text numberOfLines={2} ellipsizeMode='tail' style={{ flex: 1, fontSize: 16, fontWeight: "500", color: "#333", width: 150 }}>No image is Available</Text>
                                                                                )
                                                                            }
                                                                        </View>
                                                                        <Text >{item?.name}</Text>
                                                                    </Pressable>
                                                                )
                                                            })}
                                                        </ScrollView>
                                                    )}
                                                </View>
                                            </View>

                                            <View style={{ padding: 12, backgroundColor: "white" }}>
                                                <View style={{ flexDirection: "row", padding: 1, alignItems: "center", justifyContent: "space-between" }}>
                                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                                        <MaterialIcons name="keyboard-arrow-down" size={25} color="black" />
                                                        <Text style={{ fontSize: 15, fontWeight: "bold" }}>Add a Title</Text>
                                                    </View>
                                                    <MaterialCommunityIcons name="dots-horizontal" size={25} color="gray" />
                                                </View>
                                                <View style={{
                                                    marginTop: 10,
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    gap: 10
                                                }}>
                                                    <Pressable style={{
                                                        padding: 6,
                                                        borderRadius: 10,
                                                        backgroundColor: '#F0F0F0',
                                                        flexDirection: "row",
                                                        alignItems: "center",
                                                        gap: 5,
                                                        flex: 1
                                                    }}>
                                                        <MaterialIcons
                                                            name="location-pin"
                                                            size={25}
                                                            color="gray"
                                                        />
                                                        <TextInput
                                                            placeholder='Add a Title'
                                                        />
                                                    </Pressable>
                                                    <View style={{
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: 25,
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        backgroundColor: "#F0F0F0"
                                                    }}>
                                                        <MaterialIcons
                                                            name="attach-file"
                                                            size={25}
                                                            color="black"
                                                        />
                                                    </View>
                                                    <View style={{
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: 25,
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        backgroundColor: "#F0F0F0"
                                                    }}>
                                                        <MaterialCommunityIcons
                                                            name="map-check-outline"
                                                            size={25}
                                                            color="black"
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        </ScrollView>
                                    )}
                                </View>


                                <View>
                                    {option == "Itinerary" && (
                                        <ScrollView style={{ marginTop: 15, marginHorizontal: 10 }}>
                                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                                {route?.params?.item?.itinerary?.map((item, index) => (
                                                    <View style={{ borderRadius: 8, marginBottom: 7, backgroundColor: "orange", marginVertical: 10, padding: 10 }}>
                                                        <Text style={{ fontSize: 15, fontWeight: "500", textAlign: "center", color: "white" }}>{formateDate(item?.date)}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                            <View>
                                                {route?.params?.item?.itinerary?.map((item, index) => (
                                                    <View key={index} style={{ padding: 14, borderRadius: 8, marginBottom: 7, backgroundColor: "white", marginVertical: 10 }}>
                                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                                            <Text style={{ fontSize: 27, fontWeight: "bold" }}>{formateDate(item?.date)}</Text>
                                                            <Text style={{ fontSize: 14, color: "gray", fontWeight: "500" }}>Add subheading</Text>
                                                        </View>

                                                        <View>
                                                            {itinerary?.filter(place => place.date == item?.date).map((filteredItem, filteredIndex) =>
                                                                filteredItem?.activities?.map((item, index) => (
                                                                    <Pressable style={{ marginTop: 12 }}>
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
                                                                    </Pressable>
                                                                ))
                                                            )}
                                                        </View>

                                                        <View style={{
                                                            marginTop: 10,
                                                            flexDirection: "row",
                                                            alignItems: "center",
                                                            gap: 10
                                                        }}>
                                                            <Pressable
                                                                onPress={() => setOpenModal(item)}
                                                                style={{
                                                                    padding: 6,
                                                                    borderRadius: 10,
                                                                    backgroundColor: '#F0F0F0',
                                                                    flexDirection: "row",
                                                                    alignItems: "center",
                                                                    gap: 5,
                                                                    flex: 1
                                                                }}>
                                                                <MaterialIcons
                                                                    name="location-pin"
                                                                    size={25}
                                                                    color="gray"
                                                                />
                                                                <TextInput
                                                                    placeholder='Add a Title'
                                                                />
                                                            </Pressable>
                                                            <View style={{
                                                                width: 44,
                                                                height: 44,
                                                                borderRadius: 25,
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                                backgroundColor: "#F0F0F0"
                                                            }}>
                                                                <MaterialIcons
                                                                    name="attach-file"
                                                                    size={25}
                                                                    color="black"
                                                                />
                                                            </View>
                                                            <View style={{
                                                                width: 44,
                                                                height: 44,
                                                                borderRadius: 25,
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                                backgroundColor: "#F0F0F0"
                                                            }}>
                                                                <MaterialCommunityIcons
                                                                    name="map-check-outline"
                                                                    size={25}
                                                                    color="black"
                                                                />
                                                            </View>
                                                        </View>

                                                    </View>
                                                ))}
                                            </View>
                                        </ScrollView>
                                    )}
                                </View>

                                <View>
                                    {option == "Explore" && (
                                        <ScrollView style={{ marginTop: 15, borderRadius: 10, marginHorizontal: 12 }}>
                                            <View style={{ padding: 10, backgroundColor: "#E0E0E0", flexDirection: "row", alignItems: "center", gap: 5 }}>
                                                <MaterialIcons name="search" size={25} color="gray" />
                                                <Text>{route?.params?.item?.tripName}</Text>
                                            </View>

                                            <View style={{ marginTop: 12, padding: 1 }}>
                                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Text style={{ fontSize: 15, fontWeight: "bold" }}>Category</Text>
                                                    <Text style={{ fontSize: 15, fontWeight: "bold" }}>See all</Text>
                                                </View>
                                            </View>

                                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 15 }}>
                                                <View style={{ backgroundColor: "#E8E8E8", padding: 12, borderRadius: 7, flex: 1 }}>
                                                    <Text style={{ fontSize: 15 }}>🍽️ Restaurants</Text>
                                                </View>

                                                <View style={{ backgroundColor: "#E8E8E8", padding: 12, borderRadius: 7, flex: 1 }}>
                                                    <Text style={{ fontSize: 15 }}>☕ Cafes</Text>
                                                </View>
                                            </View>


                                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 15 }}>
                                                <View style={{ backgroundColor: "#E8E8E8", padding: 12, borderRadius: 7, flex: 1 }}>
                                                    <Text style={{ fontSize: 15 }}  >💵 Cheap Rates</Text>
                                                </View>

                                                <View style={{ backgroundColor: "#E8E8E8", padding: 12, borderRadius: 7, flex: 1 }}>
                                                    <Text style={{ fontSize: 15 }}>✈️ Travel</Text>
                                                </View>
                                            </View>

                                            <View style={{ marginTop: 10 }}>
                                                <Text style={{ fontSize: 15, fontWeight: "bold" }}>Video Guides</Text>
                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Image
                                                            style={{ width: 160, height: 110, resizeMode: "cover", borderRadius: 25 }}
                                                            source={{
                                                                uri: "https://storage.googleapis.com/gweb-uniblog-publish-prod/original_images/youtube-logo.jpeg"
                                                            }}
                                                        />
                                                    </View>


                                                    <View style={{ flex: 1 }}>
                                                        <Image
                                                            style={{ width: 160, height: 150, resizeMode: "cover", borderRadius: 25 }}
                                                            source={{
                                                                uri: "https://play-lh.googleusercontent.com/Ui_-OW6UJI147ySDX9guWWDiCPSq1vtxoC-xG17BU2FpU0Fi6qkWwuLdpddmT9fqrA=w240-h480-rw"
                                                            }}
                                                        />
                                                    </View>
                                                </View>
                                            </View>

                                        </ScrollView>
                                    )}
                                </View>
                            </View>
                        </View>


                        <View>
                            {option == "$" && (
                                <ScrollView>
                                    <View>
                                        <View style={{ padding: 10, backgroundColor: "#13274F" }}>
                                            <Text style={{ fontSize: 24, textAlign: "center", color: "white", fontWeight: "bold" }}>₹{budget ? budget : route?.params?.item?.budget}</Text>
                                            <Pressable onPress={() => setModelOpen(!modelOpen)}>
                                                <Text style={{ marginVertical: 13, textAlign: "center", color: "white", fontSize: 15 }}>Set a budget</Text>
                                            </Pressable>
                                            <View style={{ marginLeft: "auto", marginRight: "auto", padding: 10, borderRadius: 25, borderColor: "white", borderWidth: 1, width: 150 }}>
                                                <Text style={{ textAlign: "center", color: "white", fontSize: 13 }}>Deabt Summary</Text>
                                            </View>
                                        </View>

                                        <View style={{ padding: 1 }}>
                                            <View style={{ padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                                <Text style={{ fontSize: 17, fontWeight: "bold", }}>Expenses</Text>
                                                <MaterialIcons
                                                    name="person-search"
                                                    size={25}
                                                    color="black"
                                                />
                                            </View>
                                        </View>

                                        {expenses.length > 0 ? (
                                            <View style={{ marginHorizontal: 12 }}>{expenses?.map((item, index) => (
                                                <Pressable key={index}>
                                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 1 }}>
                                                        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: "#0066b2", justifyContent: "center", alignItems: "center" }}>
                                                            <Text style={{ color: "white", fontWeight: "500" }}>{index + 1}</Text>
                                                        </View>
                                                        <Text style={{ fontSize: 15, fontWeight: "500", flex: 1 }}>{item?.category}</Text>
                                                        <Text style={{ fontSize: 15, color: "#606060" }}>₹
                                                            {item?.price} ({item?.splitBy})</Text>
                                                    </View>
                                                    <Text style={{ marginTop: 5, color: "gray" }}>Paid By - {item?.paidBy}</Text>
                                                </Pressable>
                                            ))}</View>
                                        ) : (
                                            <Text style={{ padding: 10 }}>You havn't added any expenses yet</Text>
                                        )
                                        }

                                        <Pressable onPress={() => setModal(!modal)} style={{ padding: 12, backgroundColor: "#FF5733", borderRadius: 25, marginLeft: "auto", marginRight: "auto", marginTop: 30, width: 150 }}>
                                            <Text style={{ textAlign: "center", color: "white" }}>Add Expense</Text>
                                        </Pressable>
                                    </View>
                                </ScrollView>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>


            <BottomModals
                swipeDirection={['up', 'down']}
                swipeThreshold={200}
                modalAnimation={
                    new SlideAnimation({
                        slideFrom: "bottom"
                    })
                }
                visible={modalVisible}
                onTouchOutside={() => setModalVisible(!modalVisible)}
                onHardwareBackPress={() => setModalVisible(!modalVisible)}
            >
                <ModalContent style={{ height: 600, width: 400, backgroundColor: "#F8F8F8" }}>
                    <Text style={{ textAlign: "center", fontWeight: "bold" }}>Add a Place</Text>

                    <View>
                        <GooglePlacesAutocomplete
                            styles={{
                                container: {
                                    flex: 0,
                                    marginTop: 10,
                                    width: "90%",
                                    borderRadius: 20,
                                    borderColor: "#D0D0D0",
                                    borderWidth: 1,
                                    marginTop: 20
                                },
                                textInput: {
                                    height: 38,
                                    color: "#5d5d5d",
                                    fontSize: 16,
                                    borderRadius: 24
                                },
                                textInputContainer: {
                                    borderRadius: 20
                                }
                            }}
                            placeholder="search"
                            fetchDetails={true}
                            onPress={(data, details = null) => {
                                console.log("selected Place", data);
                                if (details) {
                                    console.log("this runs")
                                    const placeId = details.place_id;
                                    fetchPlaceDetails(placeId)
                                }
                            }}
                            query={{
                                key: "AIzaSyDw0tyk51M9i5GPKTPArw3_RhcBSieAgB8",
                                language: "en"
                            }}
                        />
                    </View>
                    <View>
                        <Text style={{ textAlign: "center", color: "gray", marginTop: 12 }}>Places in your list</Text>
                        {places && places?.map((item, index) => (
                            <Pressable onPress={() => {
                                console.log("Pressable clicked");
                                addPlaceToItinerary(item);
                            }} style={{ marginTop: 12 }}>
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
                            </Pressable>
                        ))}
                    </View>
                </ModalContent>
            </BottomModals>

            <Modal
                onBackdropPress={() => setModelOpen(!modelOpen)}
                onHardwareBackPress={() => setModelOpen(!modelOpen)}
                swipeDirection={['up', 'down']}
                swipeThreshold={200}
                modalTitle={<ModalTitle title='Budget Info' />}
                modalAnimation={
                    new SlideAnimation({
                        slideFrom: "bottom"
                    })
                }
                visible={modelOpen}
                onTouchOutside={() => setModelOpen(!modelOpen)}
            >
                <ModalContent style={{ width: 350, height: "auto" }}>
                    <View style={{ padding: 1 }}>
                        <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <Text style={{ fontSize: 15, fontWeight: "500" }}>Enter Budget</Text>
                            <Feather
                                name="edit-2"
                                size={20}
                                color="black"
                            />
                        </View>
                        <View style={{ marginTop: 12, justifyContent: "center", alignItems: "center" }}>
                            <TextInput
                                style={{ width: "95%", marginTop: 10, paddingBottom: 10, fontFamily: "GeezaPro-Bold", borderColor: "#E0E0E0", borderWidth: 1, padding: 10, borderRadius: 25 }}
                                placeholder='Enter a budget'
                                value={budget}
                                onChangeText={setBudget}
                            />
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center", gap: 20, justifyContent: "center", marginTop: 25 }}>
                            <Pressable onPress={() => setModelOpen(false)} style={{ padding: 10, borderRadius: 25, borderColor: "#E0E0E0", borderWidth: 1, width: 100 }}>
                                <Text style={{ textAlign: "center" }}>Cancel</Text>
                            </Pressable>

                            <Pressable onPress={() => setTripBudget(budget)} style={{ padding: 10, borderRadius: 25, backgroundColor: "#720e9e", width: 100 }}>
                                <Text style={{ textAlign: "center", color: "white" }}>Save</Text>
                            </Pressable>
                        </View>
                    </View>
                </ModalContent>
            </Modal>

            <BottomModals
                onBackdropPress={() => setModal(!Modal)}
                swipeDirection={['up', 'down']}
                swipeThreshold={200}
                modalAnimation={new SlideAnimation({ slideFrom: 'bottom' })}
                onHardwareBackPress={() => setModal(!modal)}
                visible={modal}
                onTouchOutside={() => setModal(!modal)}
            >
                <ModalContent style={{ width: 400, height: 600, backgroundColor: "#F8F8F8" }}>
                    {modalView == "original" ? (
                        <View style={{ padding: 1 }}>
                            <Text style={{ textAlign: "center", fontWeight: "bold" }}>Add a Expense</Text>
                            <View style={{ marginVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text>Rs</Text>
                                <TextInput style={{ color: "gray", fontSize: 16 }} value={price} onChangeText={setPrice} placeholder='0.0' />
                            </View>

                            <Pressable onPress={goToBlankView} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 1 }}>
                                <Text>Event ({category})</Text>
                                <Text>Select Item</Text>
                            </Pressable>

                            <View style={{ height: 2, borderColor: "#E0E0E0", borderWidth: 3, marginVertical: 20, borderRadius: 4 }} />

                            <Pressable onPress={togglePaidBy} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 1 }}>
                                <Text style={{ fontSize: 15, fontWeight: "500" }}>Paid By: You</Text>
                                <MaterialIcons
                                    name={
                                        isPaidByExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'
                                    }
                                    size={25}
                                    color="black"
                                />
                            </Pressable>
                            {isPaidByExpanded && (
                                <View style={{ marginTop: 10 }}>
                                    {route?.params?.item?.travellers?.map((item, index) => (
                                        <Pressable onPress={() => setPaidBy(item.name)} key={index} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                            <Image style={{ width: 40, height: 40, borderRadius: 20 }} source={{ uri: item?.image }} />
                                            <Text>Piad By {item?.name}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            )}

                            <Pressable onPress={toggleSplit} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10, padding: 1 }}>
                                <Text style={{ fontSize: 15, fontWeight: "500" }}>Split : Dont't Split</Text>
                                <MaterialIcons
                                    name={
                                        isSplitByExpanded ? 'keyboard-arrow-down' : "keyboard-arrow-right"
                                    }
                                    size={25}
                                    color="black"
                                />
                            </Pressable>
                            {isSplitByExpanded && (
                                <View style={{ marginTop: 10, flexDirection: "column", gap: 10 }}>
                                    <Pressable onPress={() => setValue('Individuals')}>
                                        <Text style={{ fontSize: 15, color: "gray" }}>Individuals</Text>
                                    </Pressable>
                                    <Pressable onPress={() => setValue('Everyone')}>
                                        <Text style={{ fontSize: 15, color: "gray" }}>Everyone</Text>
                                    </Pressable>
                                    <Pressable onPress={() => setValue("Don't Split")}>
                                        <Text style={{ fontSize: 15, color: "gray" }}>Dont't Split</Text>
                                    </Pressable>
                                </View>
                            )}
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 14, padding: 1 }}>
                                <Text style={{ fontSize: 15, fontWeight: "500" }}>Date: Optional</Text>
                                <MaterialIcons
                                    name='keyboard-arrow-right'
                                    size={25}
                                    color="black"
                                />
                            </View>

                            <Pressable style={{ marginTop: 30, alignSelf: "center", padding: 10, backgroundColor: "blue", borderRadius: 5 }} onPress={addExpenseToTrip}>
                                <Text style={{ color: "white" }}>Save Expense</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View>
                            <Text style={{ textAlign: "center", fontWeight: "600", marginTop: 10 }}>Expense Category</Text>
                            <Pressable style={{ marginTop: 20, alignSelf: "center", padding: 10, backgroundColor: "blue", borderRadius: 5 }} onPress={goToOriginalView}>
                                <Text style={{ color: "white" }}>Go back</Text>
                            </Pressable>

                            <View style={{ flexDirection: "row", alignItems: "center", gap: 60, flexWrap: "wrap", justifyContent: "center", marginTop: 15 }}>
                                {data?.map((item, index) => (
                                    <Pressable onPress={() => selectCategory(item)} key={index}>
                                        <View style={{ justifyContent: "center", alignItems: "center" }}>
                                            <Image style={{ width: 50, height: 50, borderRadius: 30, resizeMode: "center" }}
                                                source={{ uri: item?.image }}
                                            />
                                            <Text style={{ textAlign: "center", marginTop: 10, fontSize: 13 }}>
                                                {item?.name}
                                            </Text>
                                        </View>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    )}
                </ModalContent>
            </BottomModals>

            <BottomModals
                onBackdropPress={() => setOpneShareModal(!openShareModal)}
                swipeDirection={['up', 'down']}
                swipeThreshold={200}
                modalAnimation={
                    new SlideAnimation({
                        slideFrom: 'bottom'
                    })
                }
                onHardwareBackPress={() => setOpneShareModal(!openShareModal)}
                visible={openShareModal}
                onTouchOutside={() => setOpneShareModal(!openShareModal)}
            >
                <ModalContent style={{ width: 400, height: 300, backgroundColor: "#F8F8F8" }}>
                    <View>
                        <Text style={{ fontSize: 15, fontWeight: "500", textAlign: "center" }}>Invite Tripmates</Text>
                        <View style={{ marginVertical: 16, flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: "#E0E0E0", gap: 8, borderRadius: 7 }}>
                            <Ionicons
                                name="person-add-sharp"
                                size={20}
                                color="gray"
                            />
                            <TextInput placeholder='Invite by Email address' value={email} onChangeText={handleEmailChange} />
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20, alignSelf: "center", marginTop: 12, padding: 1 }}>
                            <View>
                                <Pressable style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#E0E0E0", alignItems: "center", justifyContent: "center" }}>
                                    <AntDesign name="link" size={23} color="gray" />

                                </Pressable>
                                <Text style={{ fontSize: 13, textAlign: "center", color: "gray", marginTop: 8 }}>Link</Text>
                            </View>

                            <View>
                                <Pressable style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#E0E0E0", alignItems: "center", justifyContent: "center" }}>
                                    <AntDesign name="message1" size={23} color="gray" />

                                </Pressable>
                                <Text style={{ fontSize: 13, textAlign: "center", color: "gray", marginTop: 8 }}>Text</Text>
                            </View>
                            <View>
                                <Pressable style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#E0E0E0", alignItems: "center", justifyContent: "center" }}>
                                    <AntDesign name="sharealt" size={23} color="gray" />

                                </Pressable>
                                <Text style={{ fontSize: 13, textAlign: "center", color: "gray", marginTop: 8 }}>Other</Text>
                            </View>
                        </View>
                        {isValidEmail && (
                            <Pressable onPress={handleSendInvite} style={{ backgroundColor: "#E97451", marginTop: 16, padding: 10, borderRadius: 8, justifyContent: "center", alignItems: "center" }}>
                                <Text style={{ color: "white", fontSize: 16, fontWeight: '500' }}>Send 1 Invite</Text>
                            </Pressable>
                        )}
                    </View>
                </ModalContent>
            </BottomModals>
            <Pressable onPress={() => navigation.navigate("Home")} style={{
                width: 60,
                height: 60,
                borderRadius: 40,
                justifyContent: "center",
                backgroundColor: "#662d91",
                marginLeft: "auto",
                position: "absolute",
                bottom: 110,
                right: 25,
                alignContent: "center"
            }}>
                <FontAwesome
                    style={{ textAlign: "center" }}
                    name="home"
                    size={30}
                    color="white"
                />
            </Pressable>

            <Pressable
                onPress={() =>
                    navigation.navigate("Map", {
                        places: places,
                    })
                }
                style={{
                    width: 60,
                    height: 60,
                    borderRadius: 40,
                    justifyContent: "center",
                    backgroundColor: "black",
                    marginLeft: "auto",
                    position: "absolute",
                    bottom: 35,
                    right: 25,
                    alignContent: 'center'
                }}>
                <Feather
                    style={{ textAlign: 'center' }}
                    name="map"
                    size={25}
                    color="white"
                />
            </Pressable>
        </>
    )
}

export default TripPlaneScreen

const styles = StyleSheet.create({})