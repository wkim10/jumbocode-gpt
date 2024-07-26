"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";

const SignInPage = () => {
  const router = useRouter();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (username === "" || password === "") {
      setError("Please fill in all fields");
    } else {
      const result = await signIn("credentials", {
        redirect: false,
        username,
        password,
        callbackUrl: "/",
      });

      if (result?.error) {
        setError(
          result.error === "CredentialsSignin"
            ? "Invalid Credentials"
            : result.error
        );
      } else {
        router.push("/");
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-4"
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-lg font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <button type="submit">Sign In</button>
        </div>
        {error ? (
          <p className="mt-4 text-center text-red-600">{error}</p>
        ) : null}
      </form>
    </div>
  );
};

export default SignInPage;
