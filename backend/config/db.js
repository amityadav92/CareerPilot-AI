const mongoose = require("mongoose");

const connectDB = async () => {

    try {

        if (!process.env.MONGO_URI) {
            throw new Error(
                "MONGO_URI is missing in environment variables."
            );
        }

        if (mongoose.connection.readyState === 1) {

            console.log("MongoDB Already Connected! ✅");

            return mongoose.connection;

        }

        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI, {

            serverSelectionTimeoutMS: 10000,

            socketTimeoutMS: 45000,

            maxPoolSize: 10,

            minPoolSize: 1

        });

        console.log("================================");
        console.log("MongoDB Connected Successfully! ✅");
        console.log("Database:", mongoose.connection.name);
        console.log("Host:", mongoose.connection.host);
        console.log("================================");

        return mongoose.connection;

    } catch (error) {

        console.error("================================");
        console.error("MongoDB Connection Failed! ❌");
        console.error("Reason:", error.message);
        console.error("================================");

        throw error;

    }

};

// ======================================
// CONNECTION EVENTS
// ======================================

mongoose.connection.on("disconnected", () => {

    console.log("MongoDB Disconnected! ⚠️");

});

mongoose.connection.on("reconnected", () => {

    console.log("MongoDB Reconnected Successfully! ✅");

});

mongoose.connection.on("error", (error) => {

    console.error("MongoDB Error:", error.message);

});
module.exports = connectDB;