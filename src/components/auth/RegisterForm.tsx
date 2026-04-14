"use client";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name, password }),
      });

      const data = (await response.json()) as
        | { success: true; userId: string }
        | { error?: string };

      if (!response.ok || !("success" in data)) {
        const errorMessage = "error" in data ? data.error : undefined;
        setError(errorMessage ?? "Registration failed");
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created, but sign in failed. Please try logging in.");
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
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="name"
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
        autoComplete="new-password"
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
        label="Confirm password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
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
        {isLoading ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link
          className="font-medium text-[#ff6a3d] hover:text-[#ff9a7c] transition"
          href="/login"
        >
          Login
        </Link>
      </p>
    </form>
  );
}