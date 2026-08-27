import * as yup from "yup";

export const registerSchema = yup.object({
  userFullName: yup
    .string()
    .trim()
    .required("User name is required"),

  email: yup
    .string()
    .trim()
    .required("Email is required")
    .email("Enter a valid email address")
    .matches(/^\S+$/, "Email must not contain spaces"),

  mobile: yup
    .string()
    .required("Mobile number is required.")
    .matches(/^\d+$/, "Only numbers are allowed — no spaces or special characters.")
    .length(11, "Mobile number must be exactly 11 digits.")
    .matches(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number (e.g. 01700000000)."),

  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(64, "Password must be at most 64 characters")
    .matches(/^\S+$/, "Password must not contain spaces")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[0-9]/, "Must contain at least one number"),

  rePassword: yup
    .string()
    .required("Please confirm your password")
    .matches(/^\S+$/, "Password must not contain spaces")
    .oneOf([yup.ref("password")], "Passwords do not match"),

  agreeToTerms: yup
    .boolean()
    .required("You must agree to the terms")
    .oneOf([true], "You must agree to all Terms, Privacy Policy and fees"),
});

export type RegisterSchema = yup.InferType<typeof registerSchema>;