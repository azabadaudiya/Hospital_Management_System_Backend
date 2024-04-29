import mongoose from "mongoose";

export const dbConnection = () =>{
  mongoose.connect(process.env.MONGO_URI, {
    dbName:"MERN_HOSPITAL_MANAGEMENT",
  }).then(()=>{
    console.log("connected to database");
  }).catch(()=>{
    console.log("error connecting to database");
  })
}
