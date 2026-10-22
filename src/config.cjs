const mongoose = require("mongoose");

const mongoURI = "mongodb+srv://thejus:thejus123@cluster0.zj88l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ Database connected successfully"))
.catch(err => console.error("❌ Database connection failed:", err));

// Schema for tracking user login + progress
const LoginSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    progress: {
        level1: { score: Number, time: Number, attempts: Number },
        level2: { score: Number, time: Number, attempts: Number },
        level3: { score: Number, time: Number, attempts: Number },
        level4: { score: Number, time: Number, attempts: Number },
        level5: { score: Number, time: Number, attempts: Number },
        level6: { score: Number, time: Number, attempts: Number }
    }
});

const collection = mongoose.model("User", LoginSchema);

module.exports = collection;
