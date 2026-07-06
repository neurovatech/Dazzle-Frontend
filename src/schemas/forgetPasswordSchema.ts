import * as yup from "yup";

export const forgetPasswordSchema = yup.object({
  email: yup
    .string()
    .trim()
    .required("Email address is required")
    .email("Enter a valid email address")
    .matches(/^\S+$/, "Email must not contain spaces"),
});

export type ForgetPasswordSchema = yup.InferType<typeof forgetPasswordSchema>;
