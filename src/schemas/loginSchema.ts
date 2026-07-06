import * as yup from "yup";

export const loginSchema = yup.object({
  username: yup
    .string()
    .trim()
    .required("Username is required")
    .matches(/^\S+$/, "Username must not contain spaces"),

  password: yup
    .string()
    .required("Password is required"),
});

export type LoginSchema = yup.InferType<typeof loginSchema>;