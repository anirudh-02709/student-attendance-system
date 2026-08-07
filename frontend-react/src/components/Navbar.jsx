import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../services/auth";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/students", label: "Manage Students" },
    { to: "/attendance", label: "Mark Attendance" },
  ];

  return (
    <header className="topbar">
      <div className="brand-wrap">
        <div className="brand-mark">A</div>
        <div className="brand-block">
          <div className="brand">
            Attendance<span>System</span>
          </div>
          <p className="brand-subtitle">Faculty operations center</p>
        </div>
      </div>

      <nav className="topnav" aria-label="Primary navigation">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;

          return (
            <Link
              key={item.to}
              className={`nav-link${isActive ? " active" : ""}`}
              to={item.to}
            >
              {item.label}
            </Link>
          );
        })}

        <button className="btn secondary btn-compact" onClick={() => logout(navigate)}>
          Logout
        </button>
      </nav>
    </header>
  );
}

export default Navbar;