"use client";
import React from "react";
import { useSocialAuth } from "@/hooks/useSocialAuth";

const GoogleIcon: React.FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9 1.99914C7.65831 1.99949 6.34498 2.38541 5.21639 3.11096C4.0878 3.83651 3.1915 4.87111 2.63421 6.09159C2.07692 7.31207 1.88212 8.66699 2.073 9.99503C2.26389 11.3231 2.83241 12.5683 3.71088 13.5824C4.58936 14.5965 5.74077 15.3368 7.02802 15.7151C8.31527 16.0934 9.68412 16.0938 10.9716 15.7163C12.2591 15.3387 13.4109 14.5991 14.29 13.5855C15.1691 12.5719 15.7383 11.3271 15.93 9.99914H10C9.73479 9.99914 9.48043 9.89379 9.2929 9.70625C9.10536 9.51871 9 9.26436 9 8.99914C9 8.73393 9.10536 8.47957 9.2929 8.29204C9.48043 8.1045 9.73479 7.99914 10 7.99914H17C17.2652 7.99914 17.5196 8.1045 17.7071 8.29204C17.8946 8.47957 18 8.73393 18 8.99914C18.0002 11.0803 17.2792 13.0972 15.9596 14.7065C14.64 16.3158 12.8035 17.4181 10.7627 17.8257C8.72183 18.2333 6.60281 17.921 4.7663 16.942C2.9298 15.963 1.48934 14.3778 0.690116 12.4563C-0.109106 10.5347 -0.217687 8.39556 0.382857 6.40294C0.9834 4.41032 2.25595 2.68741 3.98388 1.52749C5.71182 0.367575 7.78833 -0.157662 9.85996 0.0411926C11.9316 0.240047 13.8703 1.1507 15.346 2.61814C15.5288 2.80621 15.6303 3.05855 15.6288 3.3208C15.6273 3.58304 15.5229 3.8342 15.3379 4.02016C15.153 4.20612 14.9025 4.312 14.6402 4.31499C14.378 4.31798 14.1251 4.21784 13.936 4.03614C12.6257 2.72975 10.8503 1.99708 9 1.99914Z"
      fill="#E9CCAE"
    />
  </svg>
);

const FacebookIcon: React.FC = () => (
  <svg
    width="21"
    height="21"
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.1605 21.006C2.322 21.006 1.5255 20.673 0.9255 20.0805C0.3255 19.488 0 18.684 0 17.8455V3.1605C0 2.322 0.333 1.5255 0.9255 0.9255C1.518 0.3255 2.322 0 3.1605 0H17.8455C18.684 0 19.4805 0.333 20.0805 0.9255C20.6805 1.518 21.006 2.322 21.006 3.1605V17.8455C21.006 18.684 20.673 19.4805 20.0805 20.0805C19.488 20.6805 18.684 21.006 17.8455 21.006H3.1605ZM15.9855 12.141H13.7655V19.476H17.8455C18.0598 19.4766 18.2721 19.4348 18.4702 19.3531C18.6683 19.2714 18.8482 19.1513 18.9998 18.9998C19.1513 18.8482 19.2714 18.6683 19.3531 18.4702C19.4348 18.2721 19.4766 18.0598 19.476 17.8455V3.1605C19.4762 2.94632 19.4342 2.73421 19.3523 2.5363C19.2704 2.33839 19.1503 2.15857 18.9989 2.00712C18.8474 1.85568 18.6676 1.73558 18.4697 1.65371C18.2718 1.57184 18.0597 1.5298 17.8455 1.53H3.1605C2.72843 1.53119 2.3144 1.70335 2.00887 2.00887C1.70335 2.3144 1.53119 2.72843 1.53 3.1605V17.8455C1.53119 18.2776 1.70335 18.6916 2.00887 18.9971C2.3144 19.3026 2.72843 19.4748 3.1605 19.476H11.3205V12.141H8.8755V9.696H11.3205V8.382C11.3205 5.892 12.5325 4.797 14.6055 4.797C15.576 4.797 16.098 4.8675 16.3455 4.902L16.3605 4.9035V7.2435H14.9505C14.2395 7.2435 13.9035 7.548 13.8015 8.1615C13.777 8.32131 13.7655 8.48283 13.767 8.6445V9.69H16.332L15.9825 12.135L15.9855 12.141Z"
      fill="#E9CCAE"
    />
  </svg>
);

interface SocialButtonProps {
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  onClick,
  ariaLabel,
  children,
  disabled,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className="w-12 h-12 rounded-xl bg-[#222222DB] hover:bg-[#222222DB]/70 flex items-center justify-center transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);

const Spinner = () => (
  <svg
    className="animate-spin w-4.5 h-4.5 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <circle cx="12" cy="12" r="10" strokeWidth="3" />
  </svg>
);

/**
 * "Continue with Google/Facebook" — shared by both LoginForm and
 * RegisterForm since one social-login backend call covers login AND signup
 * (the provider already vouches for the person's identity, so there's no
 * separate "create account" step). See useSocialAuth for the token exchange
 * and docs/social-login-backend-requirements.txt for what the backend needs
 * to expose.
 */
const SocialLogin: React.FC = () => {
  const {
    loginWithGoogle,
    loginWithFacebook,
    isGoogleLoading,
    isFacebookLoading,
  } = useSocialAuth();
  const anyLoading = isGoogleLoading || isFacebookLoading;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-gray-500 dark:text-white">Or</p>
      <div className="flex items-center gap-3">
        <SocialButton
          onClick={loginWithGoogle}
          disabled={anyLoading}
          ariaLabel="Continue with Google"
        >
          {isGoogleLoading ? <Spinner /> : <GoogleIcon />}
        </SocialButton>
        {/* <SocialButton
          onClick={loginWithFacebook}
          disabled={anyLoading}
          ariaLabel="Continue with Facebook"
        >
          {isFacebookLoading ? <Spinner /> : <FacebookIcon />}
        </SocialButton> */}
      </div>
    </div>
  );
};

export default SocialLogin;
