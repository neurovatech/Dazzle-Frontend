import * as yup from "yup";

export const compareSchema = yup.object({
  productName: yup
    .string()
    .required("Product Name is required")
    .min(2, "Minimum 2 characters"),

  compareProduct: yup
    .string()
    .required("Compare Product is required")
    .min(2, "Minimum 2 characters"),
});

export type CompareSchema = yup.InferType<typeof compareSchema>;