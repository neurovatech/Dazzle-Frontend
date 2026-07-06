import * as yup from "yup";

export const resetPasswordSchema = yup.object({
  newPassword: yup
    .string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters")
    .max(64, "Password must be at most 64 characters")
    .matches(/^\S+$/, "Password must not contain spaces")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[0-9]/, "Must contain at least one number"),

  rePassword: yup
    .string()
    .required("Please confirm your new password")
    .matches(/^\S+$/, "Password must not contain spaces")
    .oneOf([yup.ref("newPassword")], "Passwords do not match"),
});

export type ResetPasswordSchema = yup.InferType<typeof resetPasswordSchema>;
