import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = "mongodb://localhost/medchat";

if(!MONGODB_URI) {
    throw new Error("MONGODB_URI must be definied")
}

export const connectDB = async() => {
    try{
        const {connection} = await mongoose.connect(MONGODB_URI)
    if (connection.readyState ==1){
        console.log("MongoDB connected")
        return Promise.resolve(true)
    }
    }catch(error){
        console.log(error)
        return Promise.reject(false);
    }
}