import * as yup from "yup";

const phoneRegex = /^(\+?880|0)?1[3-9]\d{8}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerSchema = yup.object({
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
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(/[@$!%*?&#]/, "Must contain at least one special character (@$!%*?&#)"),

  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),

  agreeToTerms: yup
    .boolean()
    .required("You must agree to the terms")
    .oneOf([true], "You must agree to all Terms, Privacy Policy and fees"),
});

export type RegisterSchema = yup.InferType<typeof registerSchema>;