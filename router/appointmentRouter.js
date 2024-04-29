import express from "express";
import { postAppointment,getAllAppointments,updateAppointmentStatus,deleteAppointment,getMyAppointments } from "../controller/appointmentController.js";
import {isPatientAuthenticated,isAdminAuthenticated,isDoctorAuthenticated} from "../middlewares/auth.js"
const router = express.Router();

router.post("/post",isPatientAuthenticated,postAppointment);
router.get("/getAll",isAdminAuthenticated,getAllAppointments);
router.get("/getMyAppointments",isDoctorAuthenticated,getMyAppointments);
router.put("/update/:id", isAdminAuthenticated, updateAppointmentStatus);
router.delete("/delete/:id", isAdminAuthenticated, deleteAppointment);

export default router;