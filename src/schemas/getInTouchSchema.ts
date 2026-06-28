import * as yup from "yup";

export const getInTouchSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Minimum 2 characters"),

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

  compareProduct: yup
    .string()
    .required("Compare Product is required")
    .min(2, "Minimum 2 characters"),

  message: yup.string().optional(),
});

export type GetInTouchSchema = yup.InferType<typeof getInTouchSchema>;
