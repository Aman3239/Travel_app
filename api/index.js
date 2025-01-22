const express = require("express");
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const crypto = require("crypto");
const moment = require('moment')
const nodemailer = require("nodemailer")

const app = express();
const port = 8000;
const axios = require('axios')
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const jwt = require("jsonwebtoken");

mongoose.connect("mongodb+srv://amankushwaha0507:aman12345@cluster0.q2dnj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(() => {
    console.log("Connected To MongoDB")
}).catch(err => {
    console.log("Error connecting to mongodb", err)
});

app.listen(port, () => {
    console.log("Server is runing on port 8000");
})

const Trip = require("./models/trip");
const User = require("./models/user");
app.post("/trip", async (req, res) => {
    try {
        const { tripName, startDate, endDate, startDay, endDay, background, host } = req.body;
        const start = moment(startDate);
        const end = moment(endDate);

        const itinerary = [];
        const currenDate = start.clone();
        while (currenDate.isSameOrBefore(end)) {
            itinerary.push({
                date: currenDate.format("YYYY-MM-DD"),
                activities: [],
            });
            currenDate.add(1, "days")
        }
        const trip = new Trip({
            tripName,
            startDate: moment(startDate).format("DD MMMM YYYY"),
            endDate: moment(endDate).format("DD MMMM YYYY"),
            startDay,
            endDay,
            itinerary,
            background,
            host,
            travellers: [host]
        });

        await trip.save()
        res.status(200).json(trip);
    } catch (error) {
        res.status(500).json({ message: "error creating a trip" })
    }
})

app.get('/trips/:userId', async (req, res) => {
    const { userId } = req.params; // Assuming you have the user ID stored in req.user from authentication middleware

    console.log('user', userId);

    try {
        const trips = await Trip.find({
            $or: [{ host: userId }, { travellers: userId }],
        }).populate('travellers', 'name email image');

        res.status(200).json(trips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/trip/:tripId/addPlace', async (req, res) => {
    try {
        const { tripId } = req.params;
        const { placeId } = req.body

        const API_KEY = 'AIzaSyDw0tyk51M9i5GPKTPArw3_RhcBSieAgB8';
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`;

        const response = await axios.get(url);
        const details = response.data.result;

        console.log("data", details)
        const placeData = {
            name: details.name,
            phoneNumber: details.formatted_phone_number,
            website: details.website,
            openingHours: details.opening_hours?.weekday_text,
            photos: details.photos?.map(
                photo =>
                    `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${API_KEY}`,
            ),
            reviews: details?.reviews?.map(review => ({
                authorName: review.author_name,
                rating: review.rating,
                text: review.text
            })),
            types: details?.types,
            formatted_address: details.formatted_address,
            briefDescription: details?.editorial_summary?.overview || details?.reviews[0]?.text || "No description Available",
            geometry: {
                location: {
                    lat: details.geometry?.location?.lat,
                    lng: details.geometry?.location?.lng,
                },
                viewport: {
                    northeast: {
                        lat: details.geometry.viewport.northeast.lat,
                        lng: details.geometry.viewport.northeast.lng,
                    },
                    southwest: {
                        lat: details.geometry.viewport.southwest.lat,
                        lng: details.geometry.viewport.southwest.lng,
                    },
                },
            },
        }

        const updatedTrip = await Trip.findByIdAndUpdate(tripId, {
            $push: { placesToVisit: placeData }
        }, { new: true },
        );

        res.status(200).json(updatedTrip)
    } catch (error) {
        console.log("Error".error)
        res.status(500).json({ message: "Fail to add the place to the trip" })
    }
});

app.get('/trip/:tripId/placesToVisit', async (req, res) => {
    try {
        const { tripId } = req.params;
        const trip = await Trip.findById(tripId).select("placesToVisit");

        if (!trip) {
            return res.status(404).json({ error: "trip is not found" })
        }
        res.status(200).json(trip.placesToVisit)
    } catch (error) {
        console.log("Error getting the places", error);
        res.status(500).json({ message: "Failed to fetch the places" })
    }
})

app.post("/trips/:tripId/itinerary/:date", async (req, res) => {
    try {
        const { tripId, date } = req.params;
        const newActivity = req.body;

        const updatedTrip = await Trip.findByIdAndUpdate(tripId, {
            $push: {
                'itinerary.$[entry].activities': newActivity,
            }
        },
            {
                new: true,
                arrayFilters: [{ 'entry.date': date }]
            }
        )

        if (!updatedTrip) {
            return res.status(404).json({ message: "Trip is not found" })
        }

        res.status(200).json({ message: "Activity added successfully", itinerary: updatedTrip.itinerary })
    } catch (error) {
        console.log("Error", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.get("/trip/:tripId/itinerary", async (req, res) => {
    try {
        const { tripId } = req.params;
        const trip = await Trip.findById(tripId).select('itinerary');

        if (!trip) {
            return res.status(404).json({ error: "Trip is not found" })
        }

        res.status(200).json(trip.itinerary);
    } catch (error) {
        console.log("Error", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.post("/register", async (req, res) => {
    const { name, email, password, image } = req.body;
    const newUser = new User({ name, email, password, image });

    newUser.save().then(() => {
        res.status(200).json({ message: "User is resgistered successfully!" })
    }).catch((error) => {
        console.log("Error creating a user", error);
        res.status(500).json({ message: "Error registering the user" })
    })
})

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email" })
        }
        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid password" })
        }
        const secretKey = crypto.randomBytes(32).toString('hex')
        const token = jwt.sign({ userId: user._id }, secretKey);
        res.status(200).json({ token })
    } catch (error) {
        console.log("Error", error)
        res.status(500).json({ message: "Error in login" })
    }
})

app.put('/setBudget/:userId', async (req, res) => {
    try {
        const { tripId } = req.params;
        const { budget } = req.body


        const trip = await Trip.findById(tripId);

        if (!tripId) {
            return res.json({ message: "Trip is not found" })
        }
        trip.budget = budget;

        await trip.save();
        res.status(200).json({ message: "budget is updated,trip" })
    } catch (error) {
        res.status(500).json({ message: "Error updating budget", error })
    }
})

app.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }
        return res.status(200).json({ user })
    } catch (error) {
        console.log("Error", error)
        res.status(500).json({ message: "failed to fetch user" })
    }
})

app.post('/addExpense/:tripId', async (req, res) => {
    try {
        const { tripId } = req.params;
        const { category, price, paidBy, splitBy } = req.body;
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({
                message: "Trip not found"
            })
        }

        const newExpense = {
            category,
            price,
            paidBy,
            splitBy
        };

        trip.expenses.push(newExpense)

        await trip.save();

        res.status(200).json({ message: "Expense added successfully", trip })
    } catch (error) {
        console.log("Error".error)
    }
});

app.get('/getExpenses/:tripId', async (req, res) => {
    try {
        const { tripId } = req.params;
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({
                message: "Trip not found"
            })
        }
        res.status(200).json({ expenses: trip.expenses })
    } catch (error) {
        console.log("Error", error)
    }
})

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "amankushwaha0507@gmail.com",
        pass: "tuybtybndnpdyapg"
    }
});

app.post('/sendInviteEmail', async (req, res) => {
    try {
        const { email, tripId, tripName, senderName } = req.body;

        const emailContent = `
        <h3>Hello,</h3>
    <p>${senderName} has invited you to join their trip "<strong>${tripName}</strong>".</p>
    <p>Click the button below to join the trip:</p>
    <a href="http://10.0.2.2:8000/joinTrip?tripId=${tripId}&email=${email}" 
      style="background-color: #4B61D1; color: white; padding: 10px 20px; text-decoration: none; font-size: 16px; border-radius: 5px;">
      Join Trip
    </a>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p>http://10.0.2.2:8000/joinTrip?tripId=${tripId}&email=${email}</p>
    <p>Best regards,</p>
    <p>Travelers team</p>
        `;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Invitation to join the trip : ${tripName}`,
            html: emailContent
        })

        res.status(200).json({message:"invitation sent successfully!"});
    } catch (error) {
        console.log("Error", error)
        res.status(500).json({ message: "Error sending invitation make" })
    }
})

app.get('/joinTrip',async(req,res)=>{
    try {
        const {tripId,email} =req.query;
        const normalizedEmail = email.toLowerCase();

        const user  =await User.findOne({email:normalizedEmail});
        if(!user){
            return res.status(404).json({message:"user is not found"})
        }
        const trip =  await Trip.findById(tripId)
        if(!trip){
            return res.status(404).json({message:"Trip is not found"})
        }

        if(trip.travellers.includes(user._id)){
            return res.status(404).json({message:"User is already a traveller"})
        }

        trip.travellers.push(user._id);
        await trip.save();

        res.status(200).json({message:"You have been added to the trip"})
    } catch (error) {
        console.log("Error",error)
        res.status(500).json({message:"Error adding user to trip"})
    }
})