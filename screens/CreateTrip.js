import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ImageBackground, Pressable, TouchableOpacity, TextInput, Alert } from 'react-native';
import moment from 'moment';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker
import axios from 'axios';
import { AuthContext } from '../AuthContext';

const CreateTrip = () => {
  const images = [
    {
        id: "0",
        image: "https://img.freepik.com/premium-photo/stunning-fullscreen-wallpaper-mobile_1046319-134429.jpg",
    },
    {
        id: "1",
        image: "https://wallpapers.com/images/high/full-hd-mountains-by-lake-android-qnrqfunrkzs1o0rj.webp",
    },
    {
        id: '2',
        image:
          'https://images.unsplash.com/photo-1464852045489-bccb7d17fe39?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDM1fDZzTVZqVExTa2VRfHxlbnwwfHx8fHw%3D',
      },
      {
        id: '3',
        image:
          'https://images.unsplash.com/photo-1716417511759-dd9c0f353ef9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDQ0fDZzTVZqVExTa2VRfHxlbnwwfHx8fHw%3D',
      },
      {
        id: '4',
        image:
          'https://images.unsplash.com/photo-1536928994169-e339332d0b4e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDc3fDZzTVZqVExTa2VRfHxlbnwwfHx8fHw%3D',
      },
      {
        id: '5',
        image:
          'https://images.unsplash.com/photo-1689753363735-1f7427933d0d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDV8fHxlbnwwfHx8fHw%3D',
      },
      {
        id: '6',
        image:
          'https://images.unsplash.com/photo-1577172249844-716749254893?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MTN8fHxlbnwwfHx8fHw%3D',
      },
      {
        id: '7',
        image:
          'https://images.unsplash.com/photo-1503756234508-e32369269deb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MTZ8fHxlbnwwfHx8fHw%3D',
      },
      {
        id: '8',
        image:
          'https://images.unsplash.com/photo-1715940404541-8de003993435?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDExMnw2c01WalRMU2tlUXx8ZW58MHx8fHx8',
      },
      {
        id: '9',
        image:
          'https://images.unsplash.com/photo-1489945796694-07eba0228bc7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDE1Nnw2c01WalRMU2tlUXx8ZW58MHx8fHx8',
      },
      {
        id: '10',
        image:
          'https://images.unsplash.com/photo-1715144536829-50ee7e56596d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDI1M3w2c01WalRMU2tlUXx8ZW58MHx8fHx8',
      }
];
  const navigation = useNavigation();
  const [image, setImage] = useState(images[0].image);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startDay, setStartDay] = useState("");
  const [endDay, setEndDay] = useState("");
  const [tripName, setTripName] = useState("");
  const [background, setBackground] = useState("");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false); // Show or hide start date picker
  const [showEndDatePicker, setShowEndDatePicker] = useState(false); // Show or hide end date picker
  const route = useRoute();
  const {userId,setUserId} = useContext(AuthContext)

  // Format the date in a human-readable format
  const formatDate = (date) => {
    if (date) {
      return moment(date).format("DD MMMM YYYY");
    }
    return " ";
  };

  // Handle the change in the start date
  const handleStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
    setStartDay(moment(currentDate).format('dddd')); // Set start day name
    setShowEndDatePicker(true); // Show the end date picker after selecting the start date
  };

  // Handle the change in the end date
  const handleEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;

    // Validate that end date is not before start date
    if (currentDate >= startDate) {
      setEndDate(currentDate);
      setEndDay(moment(currentDate).format('dddd')); // Set end day name
    } else {
      alert("End date must be after the start date.");
    }

    setShowEndDatePicker(false); // Hide the end date picker after selection
  };

  useEffect(() => {
    if (route?.params?.image) {
      setBackground(route?.params?.image);
    }
  }, [route?.params]);

  const handleCreateTrip = async () => {
    if (!tripName || !startDate || !endDate) {
      Alert.alert("Please fill all the blanks");
      return;
    }
  
    const tripData = {
      tripName,
      startDate:startDate,
      endDate:endDate,
      startDay,
      endDay,
      background:background,
      host:userId,
    };
  
    try {
      const response = await axios.post("https://travel-app-tan-phi.vercel.app/trip", tripData, {
        timeout: 5000, // 5 seconds timeout
      });
      console.log("Trip created successfully", response.data);
      
      Alert.alert("Success", "Trip Created successfully");
      navigation.navigate('Home')
      // Handle success - navigate to another screen or show a success message
    } catch (error) {
      console.error("Error creating trip:", error);
      Alert.alert("Error", "Failed to create trip. Please try again.");
    }
  };
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground style={{ width: '100%', height: '100%' }} source={{ uri: background ? background : image }}>
        <View style={{ padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable onPress={()=>navigation.navigate('Home')}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
          </Pressable>

          <Pressable
            onPress={handleCreateTrip}
            style={{ padding: 10, backgroundColor: 'white', borderRadius: 25 }}>
            <Text style={{ textAlign: 'center', color: 'orange', fontSize: 15, fontWeight: '500' }}>Create</Text>
          </Pressable>
        </View>

        <View style={{ padding: 15 }}>
          <TextInput
            value={tripName}
            onChangeText={setTripName}
            style={{ fontSize: 25, fontWeight: "bold", color: '#c1c9d6' }}
            placeholderTextColor={'#c1c9d6'}
            placeholder='Trip Name...'
          />
          <View style={{ backgroundColor: "#c1c9d6", marginVertical: 15, borderRadius: 20 }}>
            <View style={{ padding: 13, flexDirection: "row", alignItems: "center", gap: 7 }}>
              <AntDesign name="calendar" size={30} color="black" />
              <Text style={{ fontSize: 16, color: "#505050" }}>Itinerary</Text>
            </View>
            <View style={{ borderColor: "#e0e0e0", borderWidth: 1 }} />
            <View style={{ padding: 15 }}>
              {/* Start Date */}
              <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 20, justifyContent: "space-between" }}>
                <View>
                  <Text style={{ color: "#505050" }}>{startDate ? startDay : "Starts"}</Text>
                  <Text style={{ marginTop: 6, fontSize: 15 }}>{startDate ? formatDate(startDate) : "Set Start Date"}</Text>
                </View>
                <Pressable onPress={() => setShowStartDatePicker(true)}>
                  <AntDesign name="calendar" size={20} color="black" />
                </Pressable>
              </Pressable>

              {/* End Date */}
              <View style={{ marginTop: 20, flexDirection: "row", alignItems: "center", gap: 20, justifyContent: "space-between" }}>
                <View>
                  <Text style={{ color: "#505050" }}>{endDate ? endDay : "Ends"}</Text>
                  <Text style={{ marginTop: 6, fontSize: 15 }}>{endDate ? formatDate(endDate) : "Set End Date"}</Text>
                </View>
                <Pressable onPress={() => setShowEndDatePicker(true)}>
                  <AntDesign name="calendar" size={20} color="black" />
                </Pressable>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
            <View style={{ backgroundColor: "#c1c9d6", borderRadius: 20, padding: 15, flex: 1 }}>
              <AntDesign name="earth" size={25} color="black" />
              <Text style={{ marginTop: 10, fontSize: 15, fontWeight: "600" }}>TimeZone</Text>
              <Text style={{ marginTop: 10, fontSize: 15, fontWeight: "600", color: "#505050" }}>Benguluru, India</Text>
            </View>
            <Pressable onPress={() => navigation.navigate("Image")} style={{ backgroundColor: "#c1c9d6", borderRadius: 20, padding: 15, flex: 1 }}>
              <FontAwesome name="photo" size={30} color="black" />
              <Text style={{ marginTop: 10, fontSize: 15, fontWeight: "600", color: "#505050" }}></Text>
              <Text style={{ marginTop: 10, fontSize: 15, fontWeight: "600", color: "#505050" }}>Choose Image</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>

      {/* Date Picker for Start Date */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
          minimumDate={new Date()} // Optional: Prevent selecting past dates
        />
      )}

      {/* Date Picker for End Date */}
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
          minimumDate={startDate} // Prevent selecting end date before start date
        />
      )}
    </SafeAreaView>
  );
};

export default CreateTrip;

const styles = StyleSheet.create({});
