"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Route } from "@/routers/types";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import GoogleSigninButton from "../GoogleSigninButton";

// Validation schema
const signupSchema = yup.object().shape({
  firstName: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(30, "Name must be less than 30 characters"),
  lastName: yup
    .string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(30, "Last name must be less than 30 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address")
    .max(100, "Email must be less than 100 characters"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
  termsAccepted: yup
    .boolean()
    .oneOf([true], "You must agree to the terms of use and privacy policy"),
  newsletter: yup.boolean(),
  recaptcha: yup.boolean().oneOf([true], "Please complete the reCAPTCHA verification"),
});

type FormData = yup.InferType<typeof signupSchema>;

// NOGL Logo Component
const NoglLogo = () => (
  <svg
    width="220"
    height="32"
    viewBox="0 0 178 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    {/* Blue path */}
    <path
      d="M18.7422 24.577C19.2754 24.577 19.9931 23.9417 23.9712 19.9657C26.5139 17.4244 28.6876 15.3545 28.7901 15.3545C28.9131 15.3545 29.1182 15.4365 29.2412 15.5184C29.3848 15.6004 29.6103 16.1743 29.7539 16.7891C29.8974 17.4039 29.9999 18.8795 29.9999 20.0682C29.9999 21.4209 29.8769 22.712 29.6513 23.5523C29.4668 24.2901 28.8926 25.7247 28.4005 26.7289C27.7648 28.0201 27.0881 29.0243 26.1038 30.09C25.3246 30.9098 24.0942 31.996 23.356 32.4879C22.6383 32.9592 21.4695 33.5946 20.7928 33.8815C20.1161 34.1479 18.7832 34.5373 17.8194 34.7422C16.5686 34.9882 15.5843 35.0497 14.2309 34.9677C13.2261 34.9062 11.8317 34.7013 11.155 34.5373C10.4783 34.3529 9.14546 33.82 8.20219 33.3486C7.1769 32.8158 5.94655 31.9755 5.14682 31.2377C4.40861 30.5614 3.46534 29.5777 3.03471 29.0448C2.48106 28.3685 2.23499 27.8561 2.23499 27.4052C2.23499 26.8109 2.68611 26.278 6.50021 22.4866C9.78115 19.1869 10.868 18.2237 11.2576 18.2237C11.6472 18.2442 12.5905 19.0435 14.9486 21.4004C17.6349 24.0646 18.2296 24.5565 18.7422 24.577Z"
      fill="#375DFB"
    />
    {/* Cyan path */}
    <path
      d="M10.5605 5.64119C11.1142 5.45674 12.1395 5.2313 12.8162 5.12882C13.4929 5.00586 14.8257 4.96487 15.7895 5.02636C16.7533 5.06735 18.0862 5.25181 18.7629 5.41576C19.4396 5.60021 20.5469 5.9896 21.2236 6.29701C21.9003 6.62492 22.9051 7.19878 23.4792 7.56768C24.0329 7.95708 24.8736 8.5924 25.3042 9.00229C25.7554 9.39168 26.5141 10.2729 27.0062 10.9493C27.4984 11.6256 27.9085 12.3839 27.888 12.6298C27.888 12.9372 27.3343 13.675 26.3911 14.6383C25.5913 15.499 24.7506 16.1754 24.5455 16.1754C24.3405 16.1754 23.8893 15.6835 23.4587 14.9867C23.0486 14.3514 22.4744 13.5521 22.1668 13.2242C21.8798 12.8962 21.08 12.2814 20.4033 11.8305C19.7267 11.4001 18.5783 10.8468 17.8401 10.6214C17.0404 10.3754 15.9331 10.232 15.0718 10.232C14.2721 10.232 13.1648 10.3549 12.6111 10.5189C12.0369 10.6624 11.0937 11.0312 10.499 11.3182C9.92484 11.6256 9.00208 12.2609 8.46893 12.7323C7.95628 13.2242 7.23857 14.0644 6.86947 14.6383C6.52087 15.1916 6.04923 16.0729 5.86468 16.5853C5.65962 17.0976 5.41355 18.2863 5.14697 20.9916L3.34246 22.7951C2.35818 23.7788 1.37389 24.5781 1.16883 24.5781C0.984282 24.5781 0.738211 24.4142 0.635682 24.2092C0.533153 24.0248 0.3486 23.2664 0.225565 22.5286C0.102529 21.7908 0 20.6227 0 19.9054C0 19.2086 0.143541 17.9174 0.328094 17.0361C0.512647 16.1754 0.881753 14.9047 1.16883 14.2284C1.45592 13.5521 2.07109 12.4044 2.56323 11.6666C3.03487 10.9288 4.08067 9.74009 4.85989 9.00229C5.70063 8.203 6.95149 7.32175 7.91527 6.82989C8.79702 6.35851 9.98636 5.82564 10.5605 5.64119Z"
      fill="#00C8F4"
    />
    {/* NOGL text */}
    <text
      x="42"
      y="27"
      className="font-inter text-lg font-semibold fill-gray-900"
      style={{ fontSize: "19px", letterSpacing: "-0.006em" }}
    >
      NOGL
    </text>
  </svg>
);

// Password Strength Indicator Component
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const getStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = getStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${strengthColors[strength - 1] || 'bg-gray-200'}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-600">{strengthLabels[strength - 1] || 'Very Weak'}</span>
      </div>
    </div>
  );
};

// Magic Link Signup Component
const MagicLinkSignup = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMagicLinkSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      toast.error("Please enter your email address.");
      setLoading(false);
      return;
    }

    try {
      const callback = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: `${window.location.origin}/onboarding`
      });

      if (callback?.ok) {
        toast.success("Magic link sent to your email! Check your inbox to complete signup.");
        setEmail("");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleMagicLinkSignup} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 h-12 px-4 py-1.5 rounded-lg border border-[#CED4DA] bg-white text-sm font-normal leading-[21px] text-[#6C757D] font-inter tracking-[0.28px] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 px-6 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-semibold text-sm"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            "Send Link"
          )}
        </button>
      </div>
      <p className="text-xs text-gray-500 text-center">
        We'll send you a magic link to create your account
      </p>
    </form>
  );
};


// ReCAPTCHA Component Mock (replace with actual implementation)
const RecaptchaComponent = ({ onChange }: { onChange: (verified: boolean) => void }) => {
  const [verified, setVerified] = useState(false);

  const handleCheck = () => {
    const newVerified = !verified;
    setVerified(newVerified);
    onChange(newVerified);
  };

  return (
    <div className="flex w-full max-w-[368px] p-2.5 justify-between items-center border border-[#E9EAEC] bg-[#F8F9FD] rounded-[10px]">
      <div className="flex items-center gap-2 flex-1">
        <div className="flex p-0.5 items-center gap-1">
          <div
            className={`w-4 h-4 rounded-sm cursor-pointer flex items-center justify-center transition-colors ${
              verified
                ? "bg-[#3B82F6] border border-[#3B82F6]"
                : "bg-white border border-[#CED4DA]"
            }`}
            onClick={handleCheck}
          >
            {verified && (
              <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                <path
                  d="M1 3.2L2.86364 6L9 1"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>
        <span className="text-sm font-medium text-[#6C757D] font-inter tracking-[0.28px] line-clamp-1">
          I'm not a robot
        </span>
      </div>
      <div className="flex flex-col justify-center items-center gap-1 flex-shrink-0">
        <div className="w-[33px] h-3 flex items-center justify-center">
          <span className="text-[10px] text-[#020434] font-medium">reCAPTCHA</span>
        </div>
        <div className="flex">
          <svg width="17" height="17" viewBox="0 0 19 19" fill="none">
            <g filter="url(#filter0_d_8044_131347)">
              <path
                d="M15.6386 3.97175C15.5583 3.87173 15.4756 3.77335 15.3905 3.67671C14.0303 2.13207 12.1537 1.1363 10.1121 0.875923C8.07048 0.61555 6.00398 1.10844 4.29968 2.26225L6.73958 5.86622C7.56702 5.30605 8.5703 5.06675 9.56149 5.19316C10.5527 5.31957 11.4638 5.80302 12.1242 6.55294C12.2722 6.72102 12.4053 6.89991 12.5228 7.08757L10.363 9.24731H17.5404V2.06992L15.6386 3.97175Z"
                fill="#1C3AA9"
              />
            </g>
            <g filter="url(#filter1_d_8044_131347)">
              <path
                d="M9.02225 0.808548H1.84485L3.72484 2.68853C2.32 3.82385 1.31015 5.38396 0.853663 7.1445C0.337101 9.13675 0.564596 11.249 1.49353 13.0856L5.37722 11.1212C4.92622 10.2296 4.81577 9.20407 5.06656 8.23683C5.31735 7.2696 5.91217 6.42697 6.73961 5.8668C6.77225 5.8447 6.80516 5.82311 6.83833 5.80201L9.02225 7.98592V0.808548Z"
                fill="#4285F4"
              />
            </g>
            <g filter="url(#filter2_d_8044_131347)">
              <path
                d="M0.582886 9.32619H7.76028L5.59176 11.4947C6.05159 12.2069 6.72292 12.7626 7.51655 13.0801C8.44429 13.4512 9.47552 13.4714 10.4171 13.1368C11.3586 12.8023 12.1459 12.1359 12.6314 11.2626L15.7705 14.3937C14.7806 15.6929 13.4297 16.6852 11.8743 17.2378C9.93498 17.927 7.81092 17.8854 5.90002 17.121C4.55579 16.5832 3.38191 15.7137 2.48053 14.6059L0.582886 16.5036V9.32619Z"
                fill="#ABABAB"
              />
            </g>
            <defs>
              <filter
                id="filter0_d_8044_131347"
                x="3.70697"
                y="0.215222"
                width="14.4262"
                height="9.62481"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset />
                <feGaussianBlur stdDeviation="0.296358" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.38 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_8044_131347" />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_dropShadow_8044_131347"
                  result="shape"
                />
              </filter>
              <filter
                id="filter1_d_8044_131347"
                x="-0.00982946"
                y="0.215833"
                width="9.62476"
                height="13.4625"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset />
                <feGaussianBlur stdDeviation="0.296358" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.38 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_8044_131347" />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_dropShadow_8044_131347"
                  result="shape"
                />
              </filter>
              <filter
                id="filter2_d_8044_131347"
                x="-0.00982946"
                y="8.73347"
                width="16.3731"
                height="9.58535"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset />
                <feGaussianBlur stdDeviation="0.296358" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.38 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_8044_131347" />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_dropShadow_8044_131347"
                  result="shape"
                />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default function SignupPageLayout() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showSocialLogin, setShowSocialLogin] = useState(true);
  const [signupMethod, setSignupMethod] = useState<"form" | "magic-link">("form");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      termsAccepted: false,
      newsletter: false,
      recaptcha: false,
    },
  });

  const watchedTerms = watch("termsAccepted");
  const watchedNewsletter = watch("newsletter");
  const watchedPassword = watch("password");

  const onSubmit = async (data: FormData) => {
    if (!recaptchaVerified) {
      toast.error("Please complete the reCAPTCHA verification");
      return;
    }

    setLoading(true);

    try {
      const sanitizedData = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
      };

      // Register the user
      const res = await axios.post("/api/user/register", sanitizedData);

      if (res.status === 200) {
        toast.success("Account created successfully! Please check your email for verification link.");

        // Sign in the user with magic link
        await signIn("email", {
          email: sanitizedData.email,
          redirect: false,
          callbackUrl: `${window.location.origin}/onboarding`,
        });
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data
          ? typeof error.response.data === "string"
            ? error.response.data
            : JSON.stringify(error.response.data)
          : "An error occurred during registration";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-white">
      {/* Left Column - Form */}
      <div className="flex flex-col w-full lg:w-1/2 min-h-screen">
        <div className="flex flex-col justify-center items-center flex-1 px-4 md:px-[120px] py-8 md:py-[136px] gap-12">
          {/* Header */}
          <div className="flex flex-col items-start gap-12 w-full">
            {/* Title */}
            <div className="flex flex-col items-start gap-3 w-full">
              <h1 className="text-[28px] font-bold leading-8 text-[#212121] font-inter tracking-[-0.28px]">
                Create Account
              </h1>
              <p className="text-base font-normal leading-5 text-[#374151] font-inter w-full">
                Start monitoring competitor prices today.
              </p>
            </div>
          </div>

          {/* Social Login */}
          {showSocialLogin && (
            <div className="w-full">
              <GoogleSigninButton text="Sign up with Google" />
            </div>
          )}

          {/* Signup Method Toggle */}
          <div className="flex w-full items-center justify-between gap-1.5 rounded-lg border border-[#CED4DA] p-1">
            <button
              type="button"
              onClick={() => setSignupMethod("form")}
              className={`flex items-center justify-center gap-2 h-[38px] w-full rounded-lg font-inter text-sm font-medium transition-colors ${
                signupMethod === "form"
                  ? "bg-[#3B82F6] text-white"
                  : "text-[#6C757D] hover:text-[#212121]"
              }`}
            >
              📝 Full Form
            </button>
            <button
              type="button"
              onClick={() => setSignupMethod("magic-link")}
              className={`flex items-center justify-center gap-2 h-[38px] w-full rounded-lg font-inter text-sm font-medium transition-colors ${
                signupMethod === "magic-link"
                  ? "bg-[#3B82F6] text-white"
                  : "text-[#6C757D] hover:text-[#212121]"
              }`}
            >
              ✨ Magic Link
            </button>
          </div>

          {/* Signup Content */}
          <div className="flex flex-col gap-10 w-full min-h-[400px]">
            {signupMethod === "form" ? (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10 w-full">
            <div className="flex flex-col gap-6 w-full">
              {/* Form Fields */}
              <div className="flex flex-col gap-5 w-full">
                {/* Name Row */}
                <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
                  {/* First Name */}
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-sm font-medium leading-[21px] text-[#212121] font-inter tracking-[0.28px]">
                    Name
                  </label>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex h-12 px-4 py-1.5 items-center gap-3 w-full rounded-lg border border-[#CED4DA] bg-white">
                        <input
                          {...register("firstName")}
                          type="text"
                          placeholder="Enter name"
                          autoComplete="given-name"
                          className="flex-1 text-sm font-normal leading-[21px] text-[#6C757D] font-inter tracking-[0.28px] bg-transparent border-none outline-none placeholder:text-[#6C757D]"
                        />
                      </div>
                      {errors.firstName && (
                        <span className="text-sm text-red-500">{errors.firstName.message}</span>
                      )}
                    </div>
                  </div>

                  {/* Last Name */}
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-sm font-medium leading-[21px] text-[#212121] font-inter tracking-[0.28px]">
                      Last Name
                    </label>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex h-12 px-4 py-1.5 items-center gap-3 w-full rounded-lg border border-[#CED4DA] bg-white">
                        <input
                          {...register("lastName")}
                          type="text"
                          placeholder="Enter last name"
                          autoComplete="family-name"
                          className="flex-1 text-sm font-normal leading-[21px] text-[#6C757D] font-inter tracking-[0.28px] bg-transparent border-none outline-none placeholder:text-[#6C757D]"
                        />
                      </div>
                      {errors.lastName && (
                        <span className="text-sm text-red-500">{errors.lastName.message}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-sm font-medium leading-[21px] text-[#212121] font-inter tracking-[0.28px]">
                    Email
                  </label>
                  <div className="flex flex-col gap-1.5 w-full">
                    <div className="flex h-12 px-4 py-1.5 items-center gap-3 w-full rounded-lg border border-[#CED4DA] bg-white">
                      <input
                        {...register("email")}
                        type="email"
                        placeholder="yourmail@gmail.com"
                        autoComplete="email"
                        className="flex-1 text-sm font-normal leading-[21px] text-[#6C757D] font-inter tracking-[0.42px] bg-transparent border-none outline-none placeholder:text-[#6C757D]"
                      />
                    </div>
                    {errors.email && (
                      <span className="text-sm text-red-500">{errors.email.message}</span>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-sm font-medium leading-[21px] text-[#212121] font-inter tracking-[0.28px]">
                    Password
                  </label>
                  <div className="flex flex-col gap-1.5 w-full">
                    <div className="flex h-12 px-4 py-1.5 items-center gap-3 w-full rounded-lg border border-[#CED4DA] bg-white">
                      <input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        autoComplete="new-password"
                        className="flex-1 text-sm font-normal leading-[21px] text-[#6C757D] font-inter tracking-[0.28px] bg-transparent border-none outline-none placeholder:text-[#6C757D]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[#737373] hover:text-[#4A5568] transition-colors"
                      >
                        {showPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <span className="text-sm text-red-500">{errors.password.message}</span>
                    )}
                    <PasswordStrengthIndicator password={watchedPassword || ""} />
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col gap-4 w-full">
                {/* Terms Checkbox */}
                <div className="flex items-center gap-3 w-full">
                  <div className="flex p-0.5 items-center gap-1">
                    <div className="w-6 h-6 relative">
                      <div
                        className={`w-[18px] h-[18px] rounded-sm transition-colors cursor-pointer absolute left-[3px] top-[3px] ${
                          watchedTerms ? "bg-[#3B82F6]" : "bg-white border border-[#CED4DA]"
                        }`}
                        onClick={() => setValue("termsAccepted", !watchedTerms)}
                      >
                        {watchedTerms && (
                          <svg
                            width="9"
                            height="6"
                            viewBox="0 0 11 8"
                            fill="none"
                            className="absolute left-[5px] top-[6px]"
                          >
                            <path
                              d="M1 4.2L3.86364 7L10 1"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 text-sm font-normal leading-[150%] tracking-[0.28px] font-inter">
                    <span className="text-[#495057]">I have read and agreed to the </span>
                    <Link href={"/tos" as Route<string>} className="text-[#212121] hover:underline">
                      terms of use
                    </Link>
                    <span className="text-[#495057]">, and </span>
                    <Link href={"/privacy-policy" as Route<string>} className="text-[#212121] hover:underline">
                      privacy policy
                    </Link>
                    <span className="text-[#212121]">.</span>
                  </div>
                </div>
                {errors.termsAccepted && (
                  <span className="text-sm text-red-500">{errors.termsAccepted.message}</span>
                )}

                {/* Newsletter Checkbox */}
                <div className="flex items-center gap-3 w-full">
                  <div className="flex p-0.5 items-center gap-1">
                    <div className="w-6 h-6 relative">
                      <div
                        className={`w-[18px] h-[18px] rounded-sm border border-[#CED4DA] bg-white cursor-pointer absolute left-[3px] top-[3px] ${
                          watchedNewsletter ? "bg-[#3B82F6]" : ""
                        }`}
                        onClick={() => setValue("newsletter", !watchedNewsletter)}
                      >
                        {watchedNewsletter && (
                          <svg
                            width="9"
                            height="6"
                            viewBox="0 0 11 8"
                            fill="none"
                            className="absolute left-[5px] top-[6px]"
                          >
                            <path
                              d="M1 4.2L3.86364 7L10 1"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="flex-1 text-sm font-normal leading-[21px] text-[#495057] font-inter tracking-[0.28px]">
                    Signup for newsletter
                  </span>
                </div>
              </div>

              {/* reCAPTCHA */}
              <RecaptchaComponent
                onChange={(verified) => {
                  setRecaptchaVerified(verified);
                  setValue("recaptcha", verified);
                }}
              />
              {errors.recaptcha && (
                <span className="text-sm text-red-500">{errors.recaptcha.message}</span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-14 px-4 py-4 justify-center items-center gap-2 w-full rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-base font-semibold leading-6 text-white font-inter tracking-[0.32px]">
                    Creating Account...
                  </span>
                </>
              ) : (
                <span className="text-base font-semibold leading-6 text-white font-inter tracking-[0.32px]">
                  Create Account
                </span>
              )}
            </button>
          </form>
            ) : (
              <div className="w-full flex flex-col justify-center">
                <MagicLinkSignup />
              </div>
            )}
          </div>

          {/* Sign In Link */}
          <div className="w-full text-center text-base font-semibold leading-[150%] tracking-[0.32px] font-inter">
            <span className="text-[#212121]">Already have an account? </span>
            <Link href={"/auth/signin" as Route<string>} className="text-[#3B82F6] hover:underline">
              Sign In
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row w-full max-w-[640px] items-start gap-4 opacity-75 p-4 md:p-10">
          <div className="flex-1 text-sm font-normal leading-5 text-[#676869] font-inter tracking-[-0.084px]">
            © 2025 - NOGL
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 text-[#676869]">📧</span>
            <span className="text-sm font-normal leading-5 text-[#676869] font-inter tracking-[-0.084px]">
              Support@nogl.io
            </span>
          </div>
        </div>
      </div>

      {/* Right Column - Modern Design */}
      <div className="flex flex-1 min-h-screen relative bg-[#0c2441] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.036]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full px-16 py-20">
          {/* Main Content */}
          <div className="flex flex-col items-center text-center max-w-md">
            {/* Title */}
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Join thousands of businesses
            </h2>
            
            {/* Subtitle */}
            <p className="text-lg text-blue-200 mb-12 leading-relaxed">
              Monitor competitor prices and stay ahead of the market with our powerful analytics platform.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">10K+</div>
                <div className="text-sm text-blue-200">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">50M+</div>
                <div className="text-sm text-blue-200">Products Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">99.9%</div>
                <div className="text-sm text-blue-200">Uptime</div>
              </div>
            </div>

            {/* Company Logos */}
            <div className="w-full">
              <p className="text-sm text-blue-200 mb-6">Trusted by leading companies</p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                {/* Company logos would go here */}
                <div className="text-white text-sm font-medium">Walmart</div>
                <div className="text-white text-sm font-medium">Amazon</div>
                <div className="text-white text-sm font-medium">Target</div>
                <div className="text-white text-sm font-medium">Best Buy</div>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-16 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 max-w-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                JD
              </div>
              <div className="ml-4">
                <div className="text-white font-semibold">John Doe</div>
                <div className="text-blue-200 text-sm">CEO, TechCorp</div>
              </div>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">
              "Pricefy has revolutionized how we track competitor pricing. The insights have helped us increase our market share by 25%."
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl"></div>
      </div>
    </div>
  );
}
