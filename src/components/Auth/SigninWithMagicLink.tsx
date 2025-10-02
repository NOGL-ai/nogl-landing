"use client";
import { useState, ChangeEvent, useEffect } from "react";
import FormButton from "../Common/Dashboard/FormButton";
import InputGroup from "../Common/Dashboard/InputGroup";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import validateEmail from "@/lib/validateEmail";
import Loader from "../Common/Loader";

export default function SigninWithMagicLink() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      setLoading(false);
      return toast.error("Please enter your email address.");
    }

    if (!validateEmail(email)) {
      setLoading(false);
      return toast.error("Please enter a valid email address.");
    }

    try {
      const callback = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: decodeURIComponent(`${window.location.origin}/onboarding`)
      });

      if (callback?.ok) {
        toast.success("Magic link sent to your email!");
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
    <form onSubmit={handleSubmit}>
      <div className='mb-5 space-y-4'>
        <InputGroup
          label='Email'
          placeholder='Enter your email'
          type='email'
          name='email'
          required
          height='50px'
          value={email}
          handleChange={handleChange}
        />

        <FormButton height='50px'>
          {loading ? (
            <>
              Sending <Loader style='border-white dark:border-dark' />
            </>
          ) : (
            "Send magic link"
          )}
        </FormButton>
      </div>
    </form>
  );
}