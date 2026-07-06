import * as yup from "yup";

export const changePasswordSchema = yup.object({
  newPassword: yup
    .string()
    .required("New password is required")
    .min(5, "Password must be at least 5 characters")
    .test("no-spaces", "Password must not contain spaces", (val) => !/\s/.test(val ?? "")),

  rePassword: yup
    .string()
    .required("Please confirm your password")
    .min(5, "Password must be at least 5 characters")
    .test("no-spaces", "Password must not contain spaces", (val) => !/\s/.test(val ?? ""))
    .oneOf([yup.ref("newPassword")], "Passwords do not match"),
});

export type ChangePasswordSchema = yup.InferType<typeof changePasswordSchema>;
