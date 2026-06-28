import * as yup from "yup";

const phoneRegex = /^(\+?880|0)?1[3-9]\d{8}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const loginSchema = yup.object({
  emailOrPhone: yup
    .string()
    .trim()
    .required("Email or phone number is required")
    .test(
      "email-or-phone",
      "Enter a valid email address or Bangladeshi phone number",
      (value) => {
        if (!value) return false;
        return emailRegex.test(value) || phoneRegex.test(value);
      }
    ),

  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(64, "Password must be at most 64 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number"),
});

export type LoginSchema = yup.InferType<typeof loginSchema>;