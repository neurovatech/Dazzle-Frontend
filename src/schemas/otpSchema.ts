import * as yup from "yup";

export const otpSchema = yup.object({
  otp: yup
    .string()
    .required("OTP is required")
    .length(6, "OTP must be exactly 6 digits")
    .matches(/^\d{6}$/, "OTP must contain only numbers"),
});

export type OtpSchema = yup.InferType<typeof otpSchema>;