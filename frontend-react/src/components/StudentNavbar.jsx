import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

function StudentNavbar() {

  const navigate = useNavigate();

  return (
    <header className="topbar">

      <div className="brand">
        Attendance<span>System</span>
      </div>

      <button
        className="btn secondary"
        onClick={() => logout(navigate)}
      >
        Logout
      </button>

    </header>
  );
}

export default StudentNavbar;