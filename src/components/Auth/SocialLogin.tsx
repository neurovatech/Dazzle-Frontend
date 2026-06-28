"use client"
import React, { useState } from "react";
import { toast } from "react-hot-toast";

const GoogleIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#3b5998">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" fill="#1877F2"/>
  </svg>
);

interface SocialButtonProps {
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const SocialButton: React.FC<SocialButtonProps> = ({ onClick, ariaLabel, children, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className="w-12 h-12 rounded-xl bg-gray-55 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center transition-colors duration-200 shadow-xs border border-gray-200 dark:border-gray-700 cursor-pointer disabled:opacity-50"
  >
    {children}
  </button>
);

const SocialLogin: React.FC = () => {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingFacebook, setLoadingFacebook] = useState(false);

  const handleGoogle = (): void => {
    setLoadingGoogle(true);
    toast.loading("Initiating Google OAuth connection...", { id: "google-auth" });
    setTimeout(() => {
      setLoadingGoogle(false);
      localStorage.setItem("user", JSON.stringify({ name: "John Doe", email: "john.doe@gmail.com" }));
      document.cookie = "token=mock-google-token-xyz; path=/";
      toast.success("Successfully logged in with Google! Welcome back, John Doe.", { id: "google-auth" });
      // Reload page to reflect login
      setTimeout(() => window.location.reload(), 800);
    }, 1500);
  };

  const handleFacebook = (): void => {
    setLoadingFacebook(true);
    toast.loading("Initiating Facebook OAuth connection...", { id: "fb-auth" });
    setTimeout(() => {
      setLoadingFacebook(false);
      localStorage.setItem("user", JSON.stringify({ name: "Jane Doe", email: "jane.doe@facebook.com" }));
      document.cookie = "token=mock-fb-token-abc; path=/";
      toast.success("Successfully logged in with Facebook! Welcome back, Jane Doe.", { id: "fb-auth" });
      setTimeout(() => window.location.reload(), 800);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-2">
      <p className="text-sm text-gray-500">Or Continue With</p>
      <div className="flex items-center gap-4">
        <SocialButton
          onClick={handleGoogle}
          disabled={loadingGoogle || loadingFacebook}
          ariaLabel="Continue with Google"
        >
          {loadingGoogle ? (
            <svg className="animate-spin w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="3" />
            </svg>
          ) : (
            <GoogleIcon />
          )}
        </SocialButton>
        <SocialButton
          onClick={handleFacebook}
          disabled={loadingGoogle || loadingFacebook}
          ariaLabel="Continue with Facebook"
        >
          {loadingFacebook ? (
            <svg className="animate-spin w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="3" />
            </svg>
          ) : (
            <FacebookIcon />
          )}
        </SocialButton>
      </div>
    </div>
  );
};

export default SocialLogin;