// @ts-nocheck
import React, { useState } from "react";
import {
  login,
  register as registerAccount,
  requestPasswordReset,
  resendVerificationEmail,
  resetPassword,
  verifyEmail
} from "./api/authApi";
import { storeToken } from "./tokenStorage";
import "./styles.css";

const routes = {
  "/": "login",
  "/login": "login",
  "/register": "register",
  "/check-email": "check-email",
  "/verify-email": "verify-success",
  "/verify-email-success": "verify-success",
  "/verify-email-invalid": "verify-invalid",
  "/forgot-password": "forgot-password",
  "/reset-password": "reset-password",
  "/404": "not-found"
};

const getPageFromPath = (path) => {
  const normalized = path.replace(/\/+$/, "") || "/";
  return routes[normalized] || "not-found";
};

const navTo = (path, setPage) => {
  window.history.pushState({}, "", path);
  const url = new URL(path, window.location.origin);
  setPage(getPageFromPath(url.pathname));
};

const getSearchParam = (name) => new URLSearchParams(window.location.search).get(name)?.trim() || "";
const getVerificationEmail = () => getSearchParam("email") || sessionStorage.getItem("pending_verification_email") || "";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
const isWeakPassword = (password) => password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password);
const weakPasswordMessage = "Password is too weak. Use at least 8 characters with a letter and a number.";

function Logo({ small = false }) {
  return (
    <div className={small ? "logo small-logo" : "logo"} aria-hidden="true">
      <span>MP</span>
    </div>
  );
}

function Icon({ name }) {
  if (name === "mail") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16v12H4z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  if (name === "lock") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        <path d="M12 14v3" />
      </svg>
    );
  }

  if (name === "eye") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="/login">
        <Logo />
        <span>Meal Planner</span>
      </a>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <span>&copy; 2026 Meal Planner</span>
    </footer>
  );
}

function ImagePanel() {
  return (
    <section className="image-panel" aria-label="Healthy meal">
      <div className="image-copy">
        <h2>Plan better.<br />Eat better.</h2>
        <p>Organize your meals and<br />stick to your goals.</p>
      </div>
    </section>
  );
}

function MessageArea({ message }) {
  if (!message) {
    return <div className="message-space" aria-live="polite" />;
  }

  return (
    <div className={`form-message ${message.type}`} role={message.type === "error" ? "alert" : "status"} aria-live="polite">
      {message.text}
    </div>
  );
}

function Field({
  id,
  label,
  placeholder,
  type = "text",
  icon,
  withEye,
  value,
  onChange,
  error,
  disabled = false
}) {
  const errorId = `${id}-error`;

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className={icon ? "input-wrap" : "input-wrap no-icon"}>
        {icon && <Icon name={icon} />}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
        {withEye && (
          <button className="eye-button" type="button" aria-label={`Show ${label.toLowerCase()}`} disabled={disabled}>
            <Icon name="eye" />
          </button>
        )}
      </div>
      {error && <span className="field-error" id={errorId}>{error}</span>}
    </div>
  );
}

function LoginPage({ setPage }) {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("session") === "expired"
      ? { type: "error", text: "Your session expired. Please log in again." }
      : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateValue = (field) => (event) => {
    setValues({ ...values, [field]: event.target.value });
    setErrors({ ...errors, [field]: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!values.email.trim()) nextErrors.email = "Email is required.";
    else if (!isValidEmail(values.email)) nextErrors.email = "Enter a valid email address.";
    if (!values.password) nextErrors.password = "Password is required.";

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setMessage({ type: "error", text: "Please fix the highlighted fields." });
      return;
    }

    setMessage(null);
    setIsLoading(true);
    try {
      const result = await login({ email: values.email, password: values.password });
      storeToken({ accessToken: result.token });
      window.location.assign("/app");
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Invalid email or password." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      <form className="auth-form compact" onSubmit={handleSubmit} noValidate>
        <div className="form-heading">
          <h1>Welcome back!</h1>
          <p>Log in to your account to continue.</p>
        </div>

        <MessageArea message={message} />

        <Field
          id="login-email"
          label="Email"
          placeholder="you@example.com"
          type="email"
          icon="mail"
          value={values.email}
          onChange={updateValue("email")}
          error={errors.email}
          disabled={isLoading}
        />
        <Field
          id="login-password"
          label="Password"
          placeholder="Enter your password"
          type="password"
          icon="lock"
          withEye
          value={values.password}
          onChange={updateValue("password")}
          error={errors.password}
          disabled={isLoading}
        />

        <div className="form-row">
          <label className="check-row">
            <input type="checkbox" disabled={isLoading} />
            <span>Remember me</span>
          </label>
          <a href="/forgot-password" onClick={(event) => {
            event.preventDefault();
            navTo("/forgot-password", setPage);
          }}>
            Forgot password?
          </a>
        </div>

        <button className="primary-button" type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Log In"}
        </button>

        <Divider />

        <p className="switch-line">
          Don't have an account?{" "}
          <a href="/register" onClick={(event) => {
            event.preventDefault();
            navTo("/register", setPage);
          }}>
            Sign up
          </a>
        </p>
      </form>
    </AuthShell>
  );
}

function SlimHeader({ setPage }) {
  return (
    <header className="slim-header">
      <a className="slim-brand" href="/login" onClick={(event) => {
        event.preventDefault();
        navTo("/login", setPage);
      }}>
        <Logo small />
        <span>Meal Planner</span>
      </a>
      <a href="/login" onClick={(event) => {
        event.preventDefault();
        navTo("/login", setPage);
      }}>
        Login
      </a>
    </header>
  );
}

function SlimShell({ children, setPage }) {
  return (
    <div className="simple-page with-header">
      <SlimHeader setPage={setPage} />
      <main className="simple-main">{children}</main>
    </div>
  );
}

function ForgotPasswordPage({ setPage }) {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!email.trim()) nextErrors.email = "Email is required.";
    else if (!isValidEmail(email)) nextErrors.email = "Enter a valid email address.";

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setMessage({ type: "error", text: "Please enter your email." });
      return;
    }

    setMessage(null);
    setIsLoading(true);
    try {
      const result = await requestPasswordReset(email.trim());
      setMessage({ type: "success", text: result.message || "Password reset link sent." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unable to send reset link." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SlimShell setPage={setPage}>
      <form className="simple-form" onSubmit={handleSubmit} noValidate>
        <h1>Forgot your password?</h1>
        <p>Enter your email and we'll send you a link<br />to reset your password.</p>
        <MessageArea message={message} />
        <Field
          id="forgot-email"
          label="Email"
          placeholder="Enter your email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setErrors({ email: "" });
          }}
          error={errors.email}
          disabled={isLoading}
        />
        <button className="primary-button small-button" type="submit" disabled={isLoading}>
          {isLoading ? "Sending reset link..." : "Send Reset Link"}
        </button>
        <a className="back-link" href="/login" onClick={(event) => {
          event.preventDefault();
          navTo("/login", setPage);
        }}>
          Back to Login
        </a>
      </form>
    </SlimShell>
  );
}

function ResetPasswordPage({ setPage }) {
  const [values, setValues] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateValue = (field) => (event) => {
    setValues({ ...values, [field]: event.target.value });
    setErrors({ ...errors, [field]: "" });
  };

  const token = getSearchParam("token");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!values.password) nextErrors.password = "Password is required.";
    else if (isWeakPassword(values.password)) nextErrors.password = weakPasswordMessage;
    if (values.confirmPassword !== values.password) nextErrors.confirmPassword = "Passwords must match.";

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setMessage({ type: "error", text: "Please fix the highlighted fields." });
      return;
    }

    if (!token) {
      setMessage({ type: "error", text: "Reset link is invalid or missing." });
      return;
    }

    setMessage(null);
    setIsLoading(true);
    try {
      const result = await resetPassword(token, values.password);
      setMessage({ type: "success", text: result.message || "Your password has been reset." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unable to reset password." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SlimShell setPage={setPage}>
      <form className="simple-form" onSubmit={handleSubmit} noValidate>
        <h1>Reset your password</h1>
        <p>Enter your new password below.</p>
        <MessageArea message={message} />
        <Field
          id="reset-password"
          label="New Password"
          placeholder="Enter new password"
          type="password"
          withEye
          value={values.password}
          onChange={updateValue("password")}
          error={errors.password}
          disabled={isLoading}
        />
        <Field
          id="reset-confirm-password"
          label="Confirm Password"
          placeholder="Confirm new password"
          type="password"
          withEye
          value={values.confirmPassword}
          onChange={updateValue("confirmPassword")}
          error={errors.confirmPassword}
          disabled={isLoading}
        />
        <button className="primary-button small-button" type="submit" disabled={isLoading}>
          {isLoading ? "Resetting password..." : "Reset Password"}
        </button>
        <a className="back-link" href="/login" onClick={(event) => {
          event.preventDefault();
          navTo("/login", setPage);
        }}>
          Back to Login
        </a>
      </form>
    </SlimShell>
  );
}

function StatusShell({ children }) {
  return (
    <main className="status-page">
      <section className="status-card">{children}</section>
    </main>
  );
}

function EnvelopeCheckIcon() {
  return (
    <div className="envelope-icon" aria-hidden="true">
      <svg viewBox="0 0 86 70">
        <path d="M9 18h62v43H9z" />
        <path d="m10 20 30 24 30-24" />
        <path d="m10 61 23-24M70 61 47 37" />
      </svg>
      <span className="status-badge success-badge">
        <svg viewBox="0 0 24 24">
          <path d="m6 12 4 4 8-9" />
        </svg>
      </span>
    </div>
  );
}

function CircleStatusIcon({ type }) {
  const isError = type === "error";
  return (
    <div className={isError ? "circle-status error-status" : "circle-status"} aria-hidden="true">
      <svg viewBox="0 0 24 24">
        {isError ? (
          <path d="m7 7 10 10M17 7 7 17" />
        ) : (
          <path d="m5 12 5 5 9-10" />
        )}
      </svg>
    </div>
  );
}

function CheckEmailPage({ setPage }) {
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const email = getVerificationEmail();

  const handleResend = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Email address is missing. Please register again." });
      return;
    }

    setMessage(null);
    setIsLoading(true);
    try {
      const result = await resendVerificationEmail(email);
      setMessage({ type: "success", text: result.message || "Verification email sent." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unable to resend verification email." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StatusShell>
      <EnvelopeCheckIcon />
      <h1>Check your email!</h1>
      <p>We've sent a verification link to<br /><strong>{email || "your email address"}</strong></p>
      <p>Please check your inbox and click the link<br />to verify your account.</p>
      <MessageArea message={message} />
      <button className="primary-button status-button" type="button" onClick={handleResend} disabled={isLoading}>
        {isLoading ? "Sending..." : "Resend Verification Email"}
      </button>
      <a className="back-link" href="/login" onClick={(event) => {
        event.preventDefault();
        navTo("/login", setPage);
      }}>
        Back to Login
      </a>
    </StatusShell>
  );
}

function VerifySuccessPage({ setPage }) {
  const [isLoading, setIsLoading] = useState(true);
  const token = getSearchParam("token");
  const email = getVerificationEmail();

  React.useEffect(() => {
    let isMounted = true;

    if (!token) {
      navTo(`/verify-email-invalid${email ? `?email=${encodeURIComponent(email)}` : ""}`, setPage);
      return undefined;
    }

    verifyEmail(token)
      .then(() => {
        if (!isMounted) return;
        sessionStorage.removeItem("pending_verification_email");
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        navTo(`/verify-email-invalid${email ? `?email=${encodeURIComponent(email)}` : ""}`, setPage);
      });

    return () => {
      isMounted = false;
    };
  }, [email, setPage, token]);

  return (
    <StatusShell>
      <CircleStatusIcon />
      <h1>{isLoading ? "Verifying email..." : "Email Verified!"}</h1>
      <p>
        {isLoading ? (
          <>Please wait while we verify your link.</>
        ) : (
          <>Your email has been successfully verified.<br />You can now log in to your account.</>
        )}
      </p>
      <button className="primary-button status-button" type="button" onClick={() => navTo("/login", setPage)} disabled={isLoading}>
        {isLoading ? "Verifying email..." : "Go to Login"}
      </button>
    </StatusShell>
  );
}

function VerifyInvalidPage({ setPage }) {
  const [message, setMessage] = useState({ type: "error", text: "Verification link expired." });
  const [isResending, setIsResending] = useState(false);
  const email = getVerificationEmail();

  const handleResend = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Email address is missing. Please register again." });
      return;
    }

    setMessage(null);
    setIsResending(true);
    try {
      const result = await resendVerificationEmail(email);
      setMessage({ type: "success", text: result.message || "Verification email sent." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unable to resend verification email." });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <StatusShell>
      <CircleStatusIcon type="error" />
      <h1>Invalid or Expired Link</h1>
      <p>
        The verification link is invalid or has expired.<br />Please request a new verification link.
      </p>
      <MessageArea message={message} />
      <button className="primary-button status-button" type="button" onClick={handleResend} disabled={isResending}>
        {isResending ? "Sending..." : "Resend Verification Email"}
      </button>
      <a className="back-link" href="/login" onClick={(event) => {
        event.preventDefault();
        navTo("/login", setPage);
      }}>
        Back to Login
      </a>
    </StatusShell>
  );
}

function BowlIcon() {
  return (
    <svg className="bowl-icon" viewBox="0 0 130 130" aria-hidden="true">
      <path d="M21 77c3 24 21 39 44 39s41-15 44-39H21Z" />
      <path d="M17 76h96" />
      <path d="M77 78 113 8M85 81l35-50" />
      <path d="M102 28c9 8 15 17 16 29M110 13c10 10 13 22 9 34" />
    </svg>
  );
}

function NotFoundPage({ setPage }) {
  return (
    <main className="status-page">
      <section className="status-card not-found-card">
        <h1 className="not-found-title">404</h1>
        <h2>Page Not Found</h2>
        <p>Sorry, the page you're looking for<br />does not exist.</p>
        <button className="primary-button status-button" type="button" onClick={() => navTo("/login", setPage)}>
          Go to Dashboard
        </button>
        <BowlIcon />
      </section>
    </main>
  );
}

function RegisterPage({ setPage }) {
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateValue = (field) => (event) => {
    const value = field === "terms" ? event.target.checked : event.target.value;
    setValues({ ...values, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!values.firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!values.lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!values.email.trim()) nextErrors.email = "Email is required.";
    else if (!isValidEmail(values.email)) nextErrors.email = "Enter a valid email address.";
    if (!values.password) nextErrors.password = "Password is required.";
    else if (isWeakPassword(values.password)) nextErrors.password = weakPasswordMessage;
    if (values.confirmPassword !== values.password) nextErrors.confirmPassword = "Passwords must match.";
    if (!values.terms) nextErrors.terms = "You must agree to the terms.";

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setMessage({ type: "error", text: "Please fix the highlighted fields." });
      return;
    }

    setMessage(null);
    setIsLoading(true);
    try {
      const result = await registerAccount({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password
      });
      const email = values.email.trim();
      sessionStorage.setItem("pending_verification_email", email);
      setMessage({ type: "success", text: result.message });
      navTo(`/check-email?email=${encodeURIComponent(email)}`, setPage);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unable to create account." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-heading">
          <h1>Create your account</h1>
          <p>Sign up to start planning your meals.</p>
        </div>

        <MessageArea message={message} />

        <div className="two-col">
          <Field
            id="register-first-name"
            label="First Name"
            placeholder="First name"
            icon="user"
            value={values.firstName}
            onChange={updateValue("firstName")}
            error={errors.firstName}
            disabled={isLoading}
          />
          <Field
            id="register-last-name"
            label="Last Name"
            placeholder="Last name"
            icon="user"
            value={values.lastName}
            onChange={updateValue("lastName")}
            error={errors.lastName}
            disabled={isLoading}
          />
        </div>

        <Field
          id="register-email"
          label="Email"
          placeholder="you@example.com"
          type="email"
          icon="mail"
          value={values.email}
          onChange={updateValue("email")}
          error={errors.email}
          disabled={isLoading}
        />
        <Field
          id="register-password"
          label="Password"
          placeholder="Create a password"
          type="password"
          icon="lock"
          withEye
          value={values.password}
          onChange={updateValue("password")}
          error={errors.password}
          disabled={isLoading}
        />
        <Field
          id="register-confirm-password"
          label="Confirm Password"
          placeholder="Confirm your password"
          type="password"
          icon="lock"
          withEye
          value={values.confirmPassword}
          onChange={updateValue("confirmPassword")}
          error={errors.confirmPassword}
          disabled={isLoading}
        />

        <div className="terms-field">
          <label className="check-row terms" htmlFor="register-terms">
            <input
              id="register-terms"
              type="checkbox"
              checked={values.terms}
              onChange={updateValue("terms")}
              disabled={isLoading}
              aria-invalid={Boolean(errors.terms)}
              aria-describedby={errors.terms ? "register-terms-error" : undefined}
            />
            <span>I agree to the Terms of Service and Privacy Policy.</span>
          </label>
          {errors.terms && <span className="field-error checkbox-error" id="register-terms-error">{errors.terms}</span>}
        </div>

        <button className="primary-button" type="submit" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create Account"}
        </button>

        <Divider />

        <p className="switch-line">
          Already have an account?{" "}
          <a href="/login" onClick={(event) => {
            event.preventDefault();
            navTo("/login", setPage);
          }}>
            Log in
          </a>
        </p>
      </form>
    </AuthShell>
  );
}

function Divider() {
  return (
    <div className="divider">
      <span></span>
      <strong>or</strong>
      <span></span>
    </div>
  );
}

function AuthShell({ children }) {
  return (
    <main className="auth-card">
      <ImagePanel />
      <section className="form-panel">{children}</section>
    </main>
  );
}

function MealPlannerAuthApp() {
  const initialPage = getPageFromPath(window.location.pathname);
  const [page, setPage] = useState(initialPage);

  React.useEffect(() => {
    const onPopState = () => {
      setPage(getPageFromPath(window.location.pathname));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  if (page === "check-email") {
    return <CheckEmailPage setPage={setPage} />;
  }

  if (page === "verify-success") {
    return <VerifySuccessPage setPage={setPage} />;
  }

  if (page === "verify-invalid") {
    return <VerifyInvalidPage setPage={setPage} />;
  }

  if (page === "forgot-password") {
    return <ForgotPasswordPage setPage={setPage} />;
  }

  if (page === "reset-password") {
    return <ResetPasswordPage setPage={setPage} />;
  }

  if (page === "not-found") {
    return <NotFoundPage setPage={setPage} />;
  }

  return (
    <div className="page">
      <Header />
      {page === "register" ? <RegisterPage setPage={setPage} /> : <LoginPage setPage={setPage} />}
      <Footer />
    </div>
  );
}

export default MealPlannerAuthApp;
