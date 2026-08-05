import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../css/style.css";
import { getDashboard } from "../services/api";
import Navbar from "../components/Navbar";

function Dashboard() {
  const [dashboard, setDashboard] = useState({
    totalStudents: 0,
    presentToday: 0,
    attendancePercentage: 0,
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await getDashboard();
        setDashboard(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadDashboard();
  }, []);

  return (
    <>
      <Navbar />

      <main className="container">
        <section className="page-header">
          <div>
            <p className="eyebrow">Overview</p>
            <h1>Student Attendance Dashboard</h1>
          </div>
        </section>

        <section className="stats-grid">
          <article className="card metric-card">
            <p className="metric-label">Total Students</p>
            <h2>{dashboard.totalStudents}</h2>
          </article>

          <article className="card metric-card">
            <p className="metric-label">Present Today</p>
            <h2>{dashboard.presentToday}</h2>
          </article>

          <article className="card metric-card">
            <p className="metric-label">Attendance %</p>
            <h2>{dashboard.attendancePercentage}%</h2>
          </article>
        </section>

        <section className="card actions-card">
          <h2>Quick Actions</h2>

          <div className="button-row">
            <Link className="btn primary" to="/students">
              Manage Students
            </Link>

            <Link className="btn secondary" to="/attendance">
              Mark Attendance
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

export default Dashboard;
