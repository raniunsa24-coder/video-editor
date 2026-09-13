
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  UserRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Film,
  Check,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const Register = ({ onLogin, onSuccess }) => {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please complete all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const result = await register(
        name.trim(),
        email.trim(),
        password
      );

      if (!result.success) {
        setError(result.message);
        return;
      }

      onSuccess();
    } catch (error) {
      console.error("Registration error:", error);
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="auth-page"
      initial={{ opacity: 0, y: 35, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="register-card">
        <div className="register-top">
          <div className="register-brand">
            <div className="brand-icon">
              <Film size={20} />
            </div>

            <span>VIDORA</span>
          </div>

          <div className="register-badge">
            <Sparkles size={15} />
            Creator account
          </div>
        </div>

        <div className="register-content">
          <div className="register-intro">
            <span className="small-label">
              START CREATING
            </span>

            <h1>
              Build your
              <br />
              <span>creative space.</span>
            </h1>

            <p>
              Create your account and unlock your personal
              video editing workspace.
            </p>

            <div className="benefits">
              <div className="benefit">
                <div>
                  <Check size={15} />
                </div>
                <span>Professional editing workspace</span>
              </div>

              <div className="benefit">
                <div>
                  <Check size={15} />
                </div>
                <span>Save and manage your projects</span>
              </div>

              <div className="benefit">
                <div>
                  <Check size={15} />
                </div>
                <span>Fast browser-based workflow</span>
              </div>
            </div>
          </div>

          <motion.form
            className="register-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <div className="form-title">
              <h2>Create account</h2>
              <p>It only takes a moment.</p>
            </div>

            <div className="input-group">
              <label>Full name</label>

              <div className="input-wrapper">
                <UserRound size={18} />

                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Email address</label>

              <div className="input-wrapper">
                <Mail size={18} />

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>

              <div className="input-wrapper">
                <Lock size={18} />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
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
              {loading ? "Creating account..." : "Create account"}
              <ArrowRight size={18} />
            </button>

            <div className="auth-switch">
              <span>Already have an account?</span>

              <button
                type="button"
                onClick={onLogin}
                disabled={loading}
              >
                Sign in
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </motion.div>
  );
};

export default Register;

