import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/style.css";
import { login } from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [loginMode, setLoginMode] = useState("faculty");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
    <div>
      <h1 id="loginTitle">
        {loginMode === "faculty" ? "Faculty Login" : "Student Login"}
      </h1>

      <form id="loginForm" onSubmit={handleSubmit}>
        <label htmlFor="loginMode">Login Type</label>

        <select
          id="loginMode"
          value={loginMode}
          onChange={(e) => setLoginMode(e.target.value)}
        >
          <option value="faculty">Faculty Login</option>
          <option value="student">Student Login</option>
        </select>

        <br />
        <br />

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

        <br />
        <br />

        <label htmlFor="password">Password</label>

        <input
          type="password"
          id="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <br />
        <br />

        <button type="submit">Login</button>
      </form>

      {errorMessage && <p id="errorMessage">{errorMessage}</p>}
    </div>
  );
}

export default Login;