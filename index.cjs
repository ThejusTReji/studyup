// index.cjs (Modified Signup Route)
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const cors = require("cors");
const collection = require("./src/config.cjs"); // Your existing User model
const GameData = require("./GameData"); // NEW: Import the GameData model

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "dist")));
app.use(express.static(path.join(__dirname, "src")));
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));
app.use("/js", express.static(path.join(__dirname, "src", "js")));

// Set EJS as the templating engine
app.set("views", path.join(__dirname, "src", "views"));
app.set("view engine", "ejs");

// ==========================
//      ROUTES
// ==========================

// ✅ Home page with navigation
app.get("/", (req, res) => {
    res.render("home"); // Renders home.ejs
});

// ✅ Login page
app.get("/login", (req, res) => {
    res.render("login"); // Renders login.ejs
});

// ✅ Signup page
app.get("/signup", (req, res) => {
    res.render("signup"); // Renders signup.ejs
});

// ✅ Game pages - Corrected to handle specific level requests
// You should have distinct routes for each level HTML file
app.get("/lev1.html", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "pro.html")); // Assuming pro.html is lev1
});
app.get("/lev2.html", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "lev2.html"));
});
app.get("/lev3.html", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "lev3.html"));
});
app.get("/lev4.html", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "lev4.html"));
});
app.get("/lev5.html", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "lev5.html"));
});
app.get("/lev6.html", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "lev6.html"));
});

// ✅ Certificate page
app.get("/certificate.html", (req, res) => {
    res.sendFile(path.join(__dirname, "src", "views", "certificate.html")); // Assuming certificate.html is in src/views
});


// ==========================
//    AUTHENTICATION
// ==========================

// ✅ Signup Route (MODIFIED)
app.post("/signup", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const existingUser = await collection.findOne({ name: username });
        if (existingUser) {
            // Send JSON response for existing user
            return res.status(400).json({ success: false, message: "User already exists! Please choose a different username." });
        }

        // Hash password & store
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new collection({ name: username, password: hashedPassword });
        await newUser.save();

        // Send JSON response for successful signup
        res.status(201).json({ success: true, message: "Sign up successful! You can now log in." });

    } catch (error) {
        console.error("Signup error:", error); // Log the actual error for debugging
        // Send JSON response for server errors during signup
        res.status(500).json({ success: false, message: "Signup failed: " + error.message });
    }
});

// ✅ Login Route (MODIFIED TO SEND USER DATA)
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user in database
        const user = await collection.findOne({ name: username });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found! Please sign up." });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect password! Try again." });
        }

        // ✅ Send user ID and username back to the client
        // The frontend JavaScript will then store this in localStorage and redirect
        res.status(200).json({
            success: true,
            message: "Login successful!",
            userId: user._id, // MongoDB's unique ID for the user
            username: user.name
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Login failed: " + error.message });
    }
});

// ==========================
//    GAME DATA API
// ==========================
// Middleware to simulate user authentication (for testing purposes)
// In a real application, you'd use a proper JWT or session middleware
// that populates req.user after successful login.
// For this example, we'll assume the frontend sends userId and username.
// If you implement proper session/JWT, you can remove userId/username from req.body
// and get it from req.user.
app.use((req, res, next) => {
    // This is a placeholder. If you have a real auth system,
    // it would populate req.user with the authenticated user's data.
    // For now, we'll rely on the frontend sending userId and username.
    next();
});

// ✅ API Endpoint to Save Game Data for a specific level
app.post('/api/save-game-data', async (req, res) => {
    // --- DEBUGGING LOG ---
    console.log("Backend: Received game data:", req.body);
    console.log("Backend: Level received:", req.body.level);
    // --- END DEBUGGING LOG ---

    try {
        const { userId, username, level, score, timeTaken } = req.body;

        // Basic validation
        if (!userId || !username || !level || score === undefined || timeTaken === undefined) {
            return res.status(400).json({ message: 'Missing required game data fields (userId, username, level, score, timeTaken).' });
        }

        // Create a new game data entry
        const newGameEntry = new GameData({
            userId,
            username,
            level, // This is the value Mongoose will validate
            score,
            timeTaken
        });

        // Save to database
        await newGameEntry.save();

        res.status(201).json({ message: 'Game data saved successfully!', data: newGameEntry });

    } catch (err) {
        console.error('Error saving game data to DB:', err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).send('Server Error');
    }
});

// ✅ NEW: API Endpoint to Get ALL Game Data for a specific user
app.get('/api/user-game-data/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Basic validation for userId (can be more robust if using ObjectId validation)
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        // Fetch all game data for the specified user
        const userGameData = await GameData.find({ userId: userId })
                                     .sort({ level: 1, timestamp: -1 }) // Sort by level, then by most recent attempt
                                     .select('level score timeTaken timestamp'); // Select specific fields

        res.json(userGameData);
    } catch (err) {
        console.error('Error fetching user game data:', err.message);
        res.status(500).send('Server Error');
    }
});


// ==========================
//    START SERVER
// ==========================
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});