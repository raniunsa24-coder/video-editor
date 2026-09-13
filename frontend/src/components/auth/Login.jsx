import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Film,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const Login = ({ onRegister, onSuccess }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(email.trim(), password);

      if (!result.success) {
        setError(result.message);
        return;
      }

      onSuccess();
    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.main
      className="auth-page"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-icon">
            <Film size={21} />
          </div>
          <span>VIDORA</span>
        </div>

        <div className="login-heading">
          <span className="small-label">WELCOME BACK</span>
          <h1>Sign in to your workspace.</h1>
          <p>
            Continue editing your projects and bring your next idea to life.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="login-email">Email address</label>

            <div className="input-wrapper">
              <Mail size={18} />

              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="login-password">Password</label>

            <div className="input-wrapper">
              <Lock size={18} />

              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              className="form-error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="login-security">
          <ShieldCheck size={17} />
          <span>Your workspace is protected by your account.</span>
        </div>

        <div className="auth-switch">
          <span>Don't have an account?</span>

          <button
            type="button"
            onClick={onRegister}
            disabled={loading}
          >
            Create account
          </button>
        </div>
      </div>
    </motion.main>
  );
};

export default Login;
