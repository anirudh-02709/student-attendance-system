import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/style.css";
import { login } from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [loginMode, setLoginMode] = useState("faculty");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");

    try {
      const data = await login(loginMode, username, password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);

      if (data.role === "STUDENT") {
        navigate("/student-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <div className="auth-hero-content">
          <div className="brand-wrap hero-brand">
            <div className="brand-mark">A</div>
            <div className="brand-block">
              <div className="brand">
                Attendance<span>System</span>
              </div>
              <p className="brand-subtitle">Modern attendance management</p>
            </div>
          </div>

          <div className="hero-copy">
            <p className="eyebrow">Secure access</p>
            <h1>Welcome back to your workspace.</h1>
            <p>
              Keep attendance tracking simple, polished, and efficient for faculty and students.
            </p>
          </div>

          <div className="hero-pills">
            <span className="hero-pill">Faculty portal</span>
            <span className="hero-pill">Student portal</span>
          </div>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-intro">
            <p className="eyebrow">Sign in</p>
            <h1 id="loginTitle">
              {loginMode === "faculty" ? "Faculty Login" : "Student Login"}
            </h1>
            <p className="page-subtitle">
              Access the attendance platform with your institution credentials.
            </p>
          </div>

          <div className="mode-switcher" role="tablist" aria-label="Login type">
            <button
              type="button"
              className={`mode-pill${loginMode === "faculty" ? " active" : ""}`}
              onClick={() => setLoginMode("faculty")}
            >
              Faculty
            </button>
            <button
              type="button"
              className={`mode-pill${loginMode === "student" ? " active" : ""}`}
              onClick={() => setLoginMode("student")}
            >
              Student
            </button>
          </div>

          <form id="loginForm" onSubmit={handleSubmit}>
            <label htmlFor="username">
              {loginMode === "faculty" ? "Username" : "USN"}
            </label>

            <input
              type="text"
              id="username"
              placeholder={
                loginMode === "faculty"
                  ? "Enter username"
                  : "Enter USN"
              }
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label htmlFor="password">Password</label>

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button className="btn primary auth-submit" type="submit">
              Sign in
            </button>
          </form>

          {errorMessage && <p id="errorMessage">{errorMessage}</p>}
        </div>
      </section>
    </div>
  );
}

export default Login;