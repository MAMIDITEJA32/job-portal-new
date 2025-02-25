import mongoose from "mongoose";

//Function to connect to mongodb

const connectDB = async () =>{
    mongoose.connection.on('connected',()=>console.log('Database Conncted'));

    await mongoose.connect(`${process.env.MONGODB_URI}/job-portal`)
    
}

export default connectDB;