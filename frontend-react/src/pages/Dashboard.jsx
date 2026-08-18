import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../css/style.css";
import { getDashboard } from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingState from "../components/LoadingState";
import AnnouncementsSection from "../components/AnnouncementsSection";

function Dashboard() {
  const [dashboard, setDashboard] = useState({
    totalStudents: 0,
    presentToday: 0,
    attendancePercentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await getDashboard();
        setDashboard(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
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
            <p className="page-subtitle">
              Keep your institution’s attendance workflow organized and streamlined.
            </p>
          </div>
        </section>

        {isLoading ? (
          <LoadingState type="stats" />
        ) : (
          <section className="stats-grid">
            <article className="card metric-card metric-card-highlight">
              <div className="metric-icon">◉</div>
              <div>
                <p className="metric-label">Total Students</p>
                <h2>{dashboard.totalStudents}</h2>
              </div>
            </article>

            <article className="card metric-card">
              <div className="metric-icon metric-icon-soft">✓</div>
              <div>
                <p className="metric-label">Present Today</p>
                <h2>{dashboard.presentToday}</h2>
              </div>
            </article>

            <article className="card metric-card">
              <div className="metric-icon metric-icon-muted">%</div>
              <div>
                <p className="metric-label">Attendance %</p>
                <h2>{dashboard.attendancePercentage}%</h2>
              </div>
            </article>
          </section>
        )}

        <section className="card actions-card" style={{ marginBottom: "2rem" }}>
          <div className="section-heading">
            <h2>Quick Actions</h2>
            <p>Move between student management and attendance marking quickly.</p>
          </div>

          <div className="button-row">
            <Link className="btn primary action-card-btn" to="/students">
              <span className="btn-icon">☰</span>
              <span>Manage Students</span>
            </Link>

            <Link className="btn secondary action-card-btn" to="/attendance">
              <span className="btn-icon">✓</span>
              <span>Mark Attendance</span>
            </Link>
          </div>
        </section>

        <AnnouncementsSection />
      </main>
      <Footer />
    </>
  );
}

export default Dashboard;

