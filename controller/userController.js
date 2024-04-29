import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";

export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, nic, dob, gender, password ,role} =
    req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password||
    !role
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("User already Registered!", 400));
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    role,
  });
  generateToken(user,"user registered",200,res);
});

export const login= catchAsyncErrors(async(req,res,next)=>{
  const {email,password,confirmPassword,role} = req.body;
  if(!email||!password||!confirmPassword||!role){
    return next(new ErrorHandler("Please provide all details!", 400));
  }
  if(password!==confirmPassword){
    return next(new ErrorHandler("password and confirm password do not match", 400));
  }
  const user=await User.findOne({email}).select("+password");
  if(!user){
    return next(new ErrorHandler("invalid password or email !", 400));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if(!isPasswordMatched){
    return next(new ErrorHandler("invalid password or email !", 400));
  }
  if(role!==user.role){
    return next(new ErrorHandler("user with this role not found !", 400));
  }
  generateToken(user,"user logged in",200,res);
});

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, nic, dob, gender, password } =
    req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler(`${isRegistered.role} with this email already Registered!`, 400));
  }

  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    role:"Admin",
  });
  generateToken(admin,"admin registered",200,res);
});

export const getAllDoctors = catchAsyncErrors(async(req,res,next)=>{
  const doctors= await User.find({role:"Doctor"});
  res.status(200).json({
    success:true,
    doctors,
  })
});

export const getUserDetails = catchAsyncErrors(async(req,res,next)=>{
  const user= req.user;
  res.status(200).json({
    success:true,
    user,
  })
});

export const logoutAdmin = catchAsyncErrors(async(req,res,next)=>{
  res.status(200).cookie("adminToken","",{
    httpOnly:true,
    expires:new Date(Date.now()),
    secure:true,
    sameSite:"None"
  }).json({
    success:true,
    message:"Admin Logging Out",
  });
});

export const logoutDoctor = catchAsyncErrors(async(req,res,next)=>{
  res.status(200).cookie("doctorToken","",{
    httpOnly:true,
    expires:new Date(Date.now()),
    secure:true,
    sameSite:"None"
  }).json({
    success:true,
    message:"Doctor Logging Out",
  });
});

export const logoutPatient = catchAsyncErrors(async(req,res,next)=>{
  res.status(200).cookie("patientToken","",{
    httpOnly:true,
    expires:new Date(Date.now()),
    secure:true,
    sameSite:"None"
  }).json({
    success:true,
    message:"Patient Logging Out",
  });
})

export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Doctor Avatar Required!", 400));
  }
  const { docAvatar } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(docAvatar.mimetype)) {
    return next(new ErrorHandler("File Format Not Supported!", 400));
  }
  const {
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    doctorDepartment,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password ||
    !doctorDepartment ||
    !docAvatar
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }
  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(
      new ErrorHandler("Doctor With This Email Already Exists!", 400)
    );
  }
  const cloudinaryResponse = await cloudinary.uploader.upload(
    docAvatar.tempFilePath
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown Cloudinary error"
    );
    return next(
      new ErrorHandler("Failed To Upload Doctor Avatar To Cloudinary", 500)
    );
  }
  const doctor = await User.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    role: "Doctor",
    doctorDepartment,
    docAvatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });
  generateToken(doctor,"doctor registered",200,res);
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  // Check if any data is provided
  if (!req.files && Object.keys(req.body).length === 0) {
    return next(new ErrorHandler("No data provided for update", 400));
  }

  // Check if image is provided
  if (!req.files || !req.files.docAvatar) {
    return next(new ErrorHandler("Doctor Avatar Required!", 400));
  }

  // Check image format
  const { docAvatar } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(docAvatar.mimetype)) {
    return next(new ErrorHandler("File Format Not Supported!", 400));
  }

  try {
    // Upload image to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(docAvatar.tempFilePath);
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown Cloudinary error");
      return next(new ErrorHandler("Failed To Upload Doctor Avatar To Cloudinary", 500));
    }

    // Get other input data
    const { firstName, lastName, email, phone, password } = req.body;

    // Update user profile with new data and avatar URL
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        firstName,
        lastName,
        email,
        phone,
        password,
        docAvatar: {
          public_id: cloudinaryResponse.public_id,
          url: cloudinaryResponse.secure_url,
        },
      },
      { new: true, runValidators: true, useFindAndModify: false }
    );

    res.status(200).json({
      success: true,
      message: "Profile Updated!",
      user
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    next(new ErrorHandler("Failed to update profile", 500));
  }
});

