export interface LoginFormValues {
  emailOrPhone: string;
  password: string;
}

export interface TextInputProps {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  error?: string;
  register: React.Ref<HTMLInputElement>;
}

export interface PasswordInputProps {
  label: string;
  name: string;
  placeholder?: string;
  error?: string;
  register: React.Ref<HTMLInputElement>;
}