"use client";
import { useState } from "react";
import Link from "next/link";
import FormButton from "../Common/Dashboard/FormButton";
import InputGroup from "../Common/Dashboard/InputGroup";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loader from "../Common/Loader";
import validator from "validator";
// Removed DOMPurify import - using validator for sanitization instead

export default function SigninWithPassword() {
  const [data, setData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Handle input changes and validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    setData((prev) => ({ ...prev, [name]: fieldValue }));
    validateField(name, fieldValue);
  };

  // Validate individual fields
  const validateField = (name: string, value: string | boolean) => {
    let error = "";

    if (name === "email") {
      if (!value) {
        error = "Email is required.";
      } else if (!validator.isEmail(value as string)) {
        error = "Invalid email address.";
      }
    } else if (name === "password") {
      if (!value) {
        error = "Password is required.";
      } else if ((value as string).length < 8) {
        error = "Password must be at least 8 characters long.";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Validate the entire form
  const isFormValid = () => {
    const { email, password } = data;
    const newErrors = {
      email: "",
      password: "",
      general: "",
    };

    let isValid = true;

    if (!email) {
      newErrors.email = "Email is required.";
      isValid = false;
    } else if (!validator.isEmail(email)) {
      newErrors.email = "Invalid email address.";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required.";
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Sanitize data before submission
  const sanitizeData = () => {
    return {
      email: data.email,
      password: data.password,
      remember: data.remember,
    };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid()) return;

    setLoading(true);
    setErrors((prev) => ({ ...prev, general: "" }));

    const sanitizedData = sanitizeData();

    const callback = await signIn("credentials", {
      ...sanitizedData,
      redirect: false,
    });

    if (callback?.error) {
      setErrors((prev) => ({ ...prev, general: callback.error || "" }));
      setLoading(false);
    }

    if (callback?.ok && !callback?.error) {
      toast.success("Logged in successfully");
      setLoading(false);
      setData({ email: "", password: "", remember: false });
      setErrors({ email: "", password: "", general: "" });
      router.push("/admin");
    }
  };

  return (
    <form className="mb-5 space-y-4" onSubmit={handleSubmit} noValidate>
      {errors.general && (
        <div className="error-message text-center">{errors.general}</div>
      )}

      <InputGroup
        label="Email"
        placeholder="Enter your email"
        type="email"
        name="email"
        required
        height="50px"
        handleChange={handleChange}
        value={data.email}
        error={errors.email}
      />

      <InputGroup
        label="Password"
        placeholder="Enter your password"
        type="password"
        name="password"
        required
        height="50px"
        handleChange={handleChange}
        value={data.password}
        error={errors.password}
      />

      <div className="flex items-center justify-between gap-2 py-2">
        <label
          htmlFor="remember"
          className="flex cursor-pointer select-none items-center font-satoshi text-base font-medium text-dark dark:text-white"
        >
          <input
            type="checkbox"
            name="remember"
            id="remember"
            className="peer sr-only"
            onChange={handleChange}
            checked={data.remember}
          />
          <span
            className={`mr-2.5 inline-flex h-5.5 w-5.5 items-center justify-center rounded-md border border-stroke bg-white text-white text-opacity-0 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-opacity-100 dark:border-stroke-dark dark:bg-white/5 ${
              data.remember ? "bg-primary" : ""
            }`}
          >
            {/* SVG for checkbox */}
          </span>
          Remember me
        </label>

        <Link
          href="/auth/forgot-password"
          className="select-none font-satoshi text-base font-medium text-dark duration-300 hover:text-primary dark:text-white dark:hover:text-primary"
        >
          Forgot Password?
        </Link>
      </div>

      <FormButton height="50px" disabled={loading}>
        {loading ? (
          <>
            Signing In <Loader style="dark:border-primary border-white" />
          </>
        ) : (
          "Sign In"
        )}
      </FormButton>
    </form>
  );
}
