import * as yup from "yup";

export const corporateSchema = yup.object({
  companyName: yup
    .string()
    .required("Company name is required")
    .min(2, "Minimum 2 characters"),

  meetingDate: yup.string().required("Meeting date is required"),

  phoneNumber: yup
    .string()
    .trim()
    .required("Phone number is required")
    .matches(
      /^(\+?880|0)?1[3-9]\d{8}$/,
      "Enter a valid Bangladeshi phone number",
    ),

  email: yup
    .string()
    .trim()
    .required("Email is required")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"),
});

export type CorporateSchema = yup.InferType<typeof corporateSchema>;
