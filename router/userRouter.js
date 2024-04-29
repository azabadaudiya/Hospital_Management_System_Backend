import express from "express";
import { patientRegister,login,addNewAdmin,getAllDoctors,getUserDetails, logoutAdmin, logoutPatient, addNewDoctor,logoutDoctor,updateProfile } from "../controller/userController.js";
import { isAdminAuthenticated,isPatientAuthenticated,isDoctorAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/patient/register",patientRegister);
router.post("/login",login);
router.post("/admin/addNew",isAdminAuthenticated,addNewAdmin);
router.get("/doctors",getAllDoctors);
router.get("/admin/me",isAdminAuthenticated,getUserDetails);
router.get("/doctor/me",isDoctorAuthenticated,getUserDetails);
router.get("/patient/me",isPatientAuthenticated,getUserDetails);
router.get("/admin/logout",isAdminAuthenticated,logoutAdmin);
router.get("/doctor/logout",isDoctorAuthenticated,logoutDoctor);
router.put("/doctor/profile",isDoctorAuthenticated,updateProfile);
router.get("/patient/logout",isPatientAuthenticated,logoutPatient);
router.post("/doctor/addNewDr",isAdminAuthenticated,addNewDoctor);
export default router;