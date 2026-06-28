import * as yup from "yup";

export const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required("Password is required")
    .required("Password is not matched"),
  // .min(6, "Password must be at least 6 characters")
  // .max(64, "Password must be at most 64 characters")
  // .matches(/[A-Z]/, "Must contain at least one uppercase letter")
  // .matches(/[a-z]/, "Must contain at least one lowercase letter")
  // .matches(/[0-9]/, "Must contain at least one number")
  // .matches(
  //   /[@$!%*?&#]/,
  //   "Must contain at least one special character (@$!%*?&#)",
  // ),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(64, "Password must be at most 64 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(
      /[@$!%*?&#]/,
      "Must contain at least one special character (@$!%*?&#)",
    ),

  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
});

export type ChangePasswordSchema = yup.InferType<typeof changePasswordSchema>;
