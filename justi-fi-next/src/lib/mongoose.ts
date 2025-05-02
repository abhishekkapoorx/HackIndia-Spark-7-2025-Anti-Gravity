import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;
let isConnected = false;

export async function connectToDB() {
  if (isConnected) return;
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as mongoose.ConnectOptions);
  isConnected = true;
  console.log("✅ MongoDB connected");
}
