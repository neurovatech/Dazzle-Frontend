import * as yup from "yup";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const feedbackSchema = yup.object({
  name: yup.string().required("Name is required"),
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

  subject: yup.string().trim().required("Subject is required"),
  description: yup.string().optional(),
  image: yup
    .mixed<FileList | File>()
    .nullable()
    .optional()
    .test("fileSize", "File size must be less than 5 MB", (value) => {
      if (!value) return true;
      let file: File | null = null;
      if (value instanceof FileList && value.length > 0) {
        file = value[0];
      } else if (value instanceof File) {
        file = value;
      }
      if (!file) return true;
      return file.size <= MAX_FILE_SIZE;
    })
    .test("fileType", "Only PDF and image files are allowed", (value) => {
      if (!value) return true;
      let file: File | null = null;
      if (value instanceof FileList && value.length > 0) {
        file = value[0];
      } else if (value instanceof File) {
        file = value;
      }
      if (!file) return true;

      const type = file.type.toLowerCase();
      return type.startsWith("image/") || type === "application/pdf";
    }),
});

export type FeedbackSchema = yup.InferType<typeof feedbackSchema>;
