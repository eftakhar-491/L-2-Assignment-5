// src/modules/otp/otp.routes.ts
import express from "express";
import { OTPController } from "./otp.controller";

const router = express.Router();

router.post("/email-otp-send", OTPController.sendOTP);
router.post("/email-otp-verify", OTPController.verifyOTP);
// Ride OTP routes

export const OtpRoutes = router;
