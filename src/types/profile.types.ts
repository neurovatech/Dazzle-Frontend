export interface ProfileTypes {
  label: string;
  icon: React.ComponentType;
  component:
    | React.ComponentType<{
        setShowOrderDetails: React.Dispatch<React.SetStateAction<boolean>>;
      }>
    | React.ComponentType<{
        setShowOtp: React.Dispatch<React.SetStateAction<boolean>>;
      }>;
}
