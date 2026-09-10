const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const Lead = require("./models/Lead");

const app = express();
const PORT = 5000;

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/miniCRM")
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });

// Middleware
app.use(express.json());

app.use(session({
    secret: "mini-crm-secret-key",
    resave: false,
    saveUninitialized: false
}));

// ===============================
// ADMIN LOGIN
// ===============================

app.post("/api/login", (req, res) => {

    const { username, password } = req.body;

    if (username === "admin" && password === "admin123") {

        req.session.isAdmin = true;

        return res.json({
            message: "Login successful"
        });
    }

    res.status(401).json({
        message: "Invalid username or password"
    });
});

// ===============================
// PROTECT CRM DASHBOARD
// ===============================

app.get("/", (req, res) => {

    if (!req.session.isAdmin) {
        return res.redirect("/login.html");
    }

    res.sendFile(__dirname + "/public/index.html");
});

// Serve other frontend files
app.use(express.static("public"));

// ===============================
// GET ALL LEADS
// ===============================

app.get("/api/leads", async (req, res) => {

    if (!req.session.isAdmin) {
        return res.status(401).json({
            message: "Please login first"
        });
    }

    try {

        const leads = await Lead.find().sort({
            createdAt: -1
        });

        res.json(leads);

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch leads"
        });
    }
});

// ===============================
// ADD NEW LEAD
// ===============================

app.post("/api/leads", async (req, res) => {

    if (!req.session.isAdmin) {
        return res.status(401).json({
            message: "Please login first"
        });
    }

    try {

        const {
            name,
            email,
            source,
            status,
            notes,
            followUp
        } = req.body;

        const newLead = await Lead.create({

            id: Date.now(),

            name: name,

            email: email,

            source: source,

            status: status || "New",

            notes: notes || "",

            followUp: followUp || ""
        });

        res.status(201).json(newLead);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to add lead"
        });
    }
});

// ===============================
// UPDATE LEAD
// ===============================

app.put("/api/leads/:id", async (req, res) => {

    if (!req.session.isAdmin) {
        return res.status(401).json({
            message: "Please login first"
        });
    }

    try {

        const id = Number(req.params.id);

        const {
            name,
            email,
            source,
            status,
            notes,
            followUp
        } = req.body;

        const lead = await Lead.findOneAndUpdate(

            { id: id },

            {
                name: name,
                email: email,
                source: source,
                status: status,
                notes: notes,
                followUp: followUp
            },

            {
                new: true,
                runValidators: true
            }
        );

        if (!lead) {

            return res.status(404).json({
                message: "Lead not found"
            });
        }

        res.json({

            message: "Lead updated successfully",

            lead: lead
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to update lead"
        });
    }
});

// ===============================
// DELETE LEAD
// ===============================

app.delete("/api/leads/:id", async (req, res) => {

    if (!req.session.isAdmin) {
        return res.status(401).json({
            message: "Please login first"
        });
    }

    try {

        const id = Number(req.params.id);

        const lead = await Lead.findOneAndDelete({
            id: id
        });

        if (!lead) {

            return res.status(404).json({
                message: "Lead not found"
            });
        }

        res.json({

            message: "Lead deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to delete lead"
        });
    }
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});