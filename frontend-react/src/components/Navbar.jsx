import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

function Navbar() {

  const navigate = useNavigate();

  return (
    <header className="topbar">

      <div className="brand">
        Attendance<span>System</span>
      </div>

      <nav className="topnav">

        <Link className="nav-link" to="/dashboard">
          Dashboard
        </Link>

        <Link className="nav-link" to="/students">
          Manage Students
        </Link>

        <Link className="nav-link" to="/attendance">
          Mark Attendance
        </Link>

        <button
          className="btn secondary"
          onClick={() => logout(navigate)}
        >
          Logout
        </button>

      </nav>

    </header>
  );
}

export default Navbar;