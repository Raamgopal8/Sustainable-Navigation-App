const mongoose = require("mongoose");

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log("✅ MongoDB connected from db.js");
	} catch (err) {
		console.error("MongoDB connection error in db.js:", err.message);
		process.exit(1);
	}
};

module.exports = connectDB;
