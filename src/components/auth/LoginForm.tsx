"use client";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        fullWidth
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            color: "#fff",
            "& fieldset": {
              borderColor: "rgba(255,255,255,0.15)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255,59,0,0.4)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#ff6a3d",
            },
          },
          "& .MuiInputLabel-root": {
            color: "rgba(255,255,255,0.6)",
            "&.Mui-focused": {
              color: "#ff6a3d",
            },
          },
        }}
      />

      <TextField
        fullWidth
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            color: "#fff",
            "& fieldset": {
              borderColor: "rgba(255,255,255,0.15)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255,59,0,0.4)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#ff6a3d",
            },
          },
          "& .MuiInputLabel-root": {
            color: "rgba(255,255,255,0.6)",
            "&.Mui-focused": {
              color: "#ff6a3d",
            },
          },
        }}
      />

      {error && (
        <p className="text-sm text-red-400 mb-3 text-center">{error}</p>
      )}

      <Button
        fullWidth
        type="submit"
        variant="contained"
        disabled={isLoading}
        sx={{
          mt: 1.5,
          mb: 2,
          bgcolor: "#ff3b00",
          color: "#fff",
          "&:hover": {
            bgcolor: "#ff6a3d",
          },
          "&:disabled": {
            bgcolor: "rgba(255,59,0,0.5)",
          },
        }}
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-center text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link
          className="font-medium text-[#ff6a3d] hover:text-[#ff9a7c] transition"
          href="/register"
        >
          Register
        </Link>
      </p>
    </form>
  );
}