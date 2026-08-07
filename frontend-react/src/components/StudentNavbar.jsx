import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

function StudentNavbar() {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="brand-wrap">
        <div className="brand-mark">A</div>
        <div className="brand-block">
          <div className="brand">
            Attendance<span>System</span>
          </div>
          <p className="brand-subtitle">Student self-service</p>
        </div>
      </div>

      <button className="btn secondary btn-compact" onClick={() => logout(navigate)}>
        Logout
      </button>
    </header>
  );
}

export default StudentNavbar;