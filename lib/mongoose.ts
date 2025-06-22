import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
	throw new Error('Please define the MONGODB_URI variable');
}

interface MongooseCache {
	conn: Mongoose;
	promise: Promise<Mongoose> | null;
}

declare global {
	var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

const dbConnect = async (): Promise<Mongoose> => {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		cached.promise = mongoose
			.connect(MONGODB_URI, {
				dbName: 'sweoverflow',
			})
			.then((result) => {
				console.log("Connected to MongoDB");
				return result;
			})
			.catch((error) => {
				console.error("MongoDB connection error:", error);
				throw error;
			})
	}

	cached.conn = await cached.promise;

	return cached.conn;
};

export default dbConnect;