"use client";
// types.ts
interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface AuthProps {
  signin: boolean;
}

// Auth.tsx
import React, { useState, ChangeEvent, FormEvent } from "react";
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const Auth: React.FC<AuthProps> = ({ signin }) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!signin) {
      // if (!formData.name) {
      //   newErrors.name = 'Name is required';
      // }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (validateForm()) {
        if (!signin) {
          await axios.post(`${BACKEND_URL}/auth/signup`, formData);
          toast.success("Account Created. Login to proceed");
          return;
        }
        const res = await axios.post(`${BACKEND_URL}/auth/login`, {
          email: formData.email,
          password: formData.password,
        });
        if (res.status === 200) {
          const token = res.data.token;
          localStorage.setItem("token", token);
          router.push("/dashboard");
        }
      }
    } catch (error) {
      console.log(error);
      if (signin) {
        toast.error("Unable to Login.");
      }
      if (!signin) {
        toast.error("Unable to Signup");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-100">
            {signin ? "Sign in to your account" : "Create your account"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {signin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              className="ml-2 text-blue-500 hover:text-blue-400"
            >
              {signin ? (
                <Link href={"/signup"}>Sign up</Link>
              ) : (
                <Link href={"/signin"}>Sign In</Link>
              )}
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/*{!signin && (
                <div>
                  <label htmlFor="name" className="text-sm font-medium text-gray-300">
                    Name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        errors.name ? 'border-red-500' : 'border-gray-600'
                      } rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Enter your name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>
              )}*/}

            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-300"
              >
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.email ? "border-red-500" : "border-gray-600"
                  } rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2 border ${
                    errors.password ? "border-red-500" : "border-gray-600"
                  } rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {!signin && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-300"
                >
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-2 border ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-600"
                    } rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Confirm your password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}
          </div>

          {signin && (
            <div className="flex items-center justify-end">
              <button
                type="button"
                className="text-sm text-blue-500 hover:text-blue-400"
              >
                Forgot your password?
              </button>
            </div>
          )}

          <button
            disabled={isLoading}
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {signin ? (
              <p className="flex items-center gap-2">
                {" "}
                {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                Login
              </p>
            ) : (
              <p className="flex items-center gap-2">
                {" "}
                {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                Create Account
              </p>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
