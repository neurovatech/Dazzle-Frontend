import * as yup from "yup";

export const resetPasswordSchema = yup.object({
  resetType: yup
    .string()
    .required("Reset type is required.")
    .oneOf(["xreset", "ereset"], "Reset type must be xreset or ereset.")
    .matches(/^\S+$/, "No spaces allowed."),

  resetToken: yup
    .string()
    .required("Reset token is required.")
    .matches(/^\S+$/, "No spaces allowed."),

  newPassword: yup
    .string()
    .required("New password is required.")
    .min(5, "Password must be at least 5 characters.")
    .matches(/^\S+$/, "Password must not contain spaces."),

  rePassword: yup
    .string()
    .required("Please confirm your new password.")
    .matches(/^\S+$/, "Password must not contain spaces.")
    .oneOf([yup.ref("newPassword")], "Passwords do not match."),
});

export type ResetPasswordSchema = yup.InferType<typeof resetPasswordSchema>;
