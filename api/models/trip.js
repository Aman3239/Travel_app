const mongoose = require('mongoose')

const activitiesSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    name: { type: String, required: true },
    phoneNumber: {
        type: String
    },
    website: { type: String },
    openingHours: [String ],
    photos: [ String ],
    reviews: [{
        authorName: String,
        rating: Number,
        text: String
    }],
    types: [String],
    formatted_address: {
        type: String,
        required: true
    },
    briefDescription: { type: String },
    geometry: {
        location: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true }
        },
        viewPort: {
            northeast: {
                lat: { type: Number, required: true }, //Northeast latitude
                lng: { type: Number, required: true }, //Northeast Longitude
            },
            southeast: {
                lat: { type: Number, required: true }, //Southeast latitude
                lng: { type: Number, required: true }, //Southeast Longitude  
            }
        }
    }
})

const itinerarySchema = new mongoose.Schema({
    date: { type: String, required: true },
    activities: [activitiesSchema]
})

const placeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String
    },
    website: { type: String },
    openingHours: [ String ],
    photos: [ String ],
    reviews: [{
        authorName: String,
        rating: Number,
        text: String
    }],
    types: [String],
    formatted_address: {
        type: String,
        required: true
    },
    briefDescription: { type: String },
    geometry: {
        location: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true }
        },
        viewPort: {
            northeast: {
                lat: { type: Number, required: true }, //Northeast latitude
                lng: { type: Number, required: true }, //Northeast Longitude
            },
            southeast: {
                lat: { type: Number, required: true }, //Southeast latitude
                lng: { type: Number, required: true }, //Southeast Longitude  
            }
        }
    }
})

const expenseSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true,
    },
    splitBy: {
        type: String,
        required: true
    },
    paidBy: {
        type: String,
        required: true
    }
})

const tripSchema = new mongoose.Schema({
    tripName: {
        type: String,
        required: true
    },
    startDate: {
        type: String,
        required: true,
    },
    endDate: {
        type: String,
        required: true
    },
    startDay: {
        type: String,
        required: true
    },
    endDay: {
        type: String,
        required: true
    },
    background: {
        type: String,
        required: true
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    travellers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    budget: {
        type: Number,
        default:0
    },
    expenses: [expenseSchema],
    placesToVisit: [placeSchema],
    itinerary: [itinerarySchema]
})

const Trip = mongoose.model("Trip",tripSchema);
module.exports = Trip;

