const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config({ path: "./db.env" });

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' })); // Allow React app to connect to the backend

// Ensure MongoDB URI is set
if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not defined in .env file!");
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => {
        console.error("Error connecting to MongoDB", err);
        process.exit(1);
    });

// Schemas and Models
const profileSchema = new mongoose.Schema({
    name: {
        FName: String,
        LName: String,
    },
    mobile: Number,
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Transgender', 'Other']
    },
    DOB: Date,
    address: {
        street: String,
        city: String,
        state: String,
        pin: Number
    }
});

const healthReportSchema = new mongoose.Schema({
    basic: [{
        name: String,
        value: String,
        date: Date
    }],
    all: {
        name: [String],
        date: [Date],
        data: [Buffer]
    }
});

const patientSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    sessionKey: String,
    profile: profileSchema,
    healthReport: healthReportSchema,
    doctorsList: [{ reg: String, date: Date }]
});

const Patient = mongoose.model('patient', patientSchema);

const doctorProfileSchema = new mongoose.Schema({
    name: {
        FName: String,
        LName: String,
    },
    registration: String,
    degree: String,
    fees: Number,
    mobile: Number,
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Transgender', 'Other']
    },
    DOB: Date,
    address: {
        street: String,
        city: String,
        state: String,
        pin: Number
    }
});

const doctorSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    sessionKey: String,
    profile: doctorProfileSchema,
    patientsList: [{ email: String, date: Date }]
});

const Doctor = mongoose.model('doctor', doctorSchema);

// Routes

// Register Patient
// Get doctor details
app.post("/patient/register", async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingPatient = await Patient.findOne({ email });
        if (existingPatient) {
            return res.json({ status: 'exist' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await Patient.create({ email, password: hashedPassword });
        return res.json({ status: 'done' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error." });
    }
});

// Register Doctor
app.post("/doctor/register", async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingDoctor = await Doctor.findOne({ email });
        if (existingDoctor) {
            return res.json({ status: 'exist' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await Doctor.create({ email, password: hashedPassword });
        return res.json({ status: 'done' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error." });
    }
});

// Razorpay Payment Orders and Verification (same as your current code)

// Start server
const port = process.env.PORT || "5000";
app.listen(port, () => {
    console.log("Server is started on PORT: " + port);
});
