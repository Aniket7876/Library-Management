import mongoose from "mongoose";

export const connectDb = () => {
    mongoose.connect(process.env.MONGOURI,{
        dbName:"Library"
    }).then(()=>{
        console.log("Database connected Successfully")
    }).catch((err)=>{
        console.log("Error while connecting with the database",err)
    })
}