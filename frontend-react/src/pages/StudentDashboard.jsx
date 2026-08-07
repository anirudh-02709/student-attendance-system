import { useEffect, useState } from "react";
import "../css/style.css";
import { getStudentDashboard, markAttendance } from "../services/api";
import StudentNavbar from "../components/StudentNavbar";
import Footer from "../components/Footer";
import LoadingState from "../components/LoadingState";

function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const data = await getStudentDashboard();

      setStudent(data.student);
      setAttendance(data.attendance);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleAttendance() {
    setStatusMessage("");

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      await markAttendance({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      setStatusMessage("Attendance marked successfully.");

      loadDashboard();
    } catch (error) {
      setStatusMessage(error.message);
    }
  }

  if (isLoading || !student || !attendance) {
    return (
      <>
        <StudentNavbar />
        <main className="container">
          <section className="page-header">
            <div>
              <p className="eyebrow">Student</p>
              <h1>Loading your workspace</h1>
              <p className="page-subtitle">Preparing your attendance overview.</p>
            </div>
          </section>
          <LoadingState type="stats" />
          <LoadingState type="table" />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <StudentNavbar />

      <main className="container">
        <section className="page-header">
          <div>
            <p className="eyebrow">Student</p>
            <h1>Welcome {student.name}</h1>
            <p className="page-subtitle">
              Keep track of your attendance record and mark your presence when needed.
            </p>
          </div>
        </section>

        <section className="stats-grid">
          <article className="card metric-card">
            <p className="metric-label">Attendance %</p>

            <h2>{attendance.attendancePercentage}%</h2>
          </article>

          <article className="card metric-card">
            <p className="metric-label">Present Count</p>

            <h2>{attendance.presentCount}</h2>
          </article>

          <article className="card metric-card">
            <p className="metric-label">Absent Count</p>

            <h2>{attendance.absentCount}</h2>
          </article>
        </section>

        <section className="card actions-card">
          <div className="section-heading">
            <h2>Mark Attendance</h2>
            <p>Use your current location to record attendance instantly.</p>
          </div>

          <div className="button-row">
            <button className="btn primary" onClick={handleAttendance}>
              Mark Attendance
            </button>
          </div>

          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </section>

        <section className="card table-card">
          <div className="section-heading">
            <h2>Attendance History</h2>
            <p>Review your recent attendance entries in one place.</p>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {attendance.attendanceHistory.length === 0 ? (
                  <tr>
                    <td colSpan="2">No attendance records found.</td>
                  </tr>
                ) : (
                  attendance.attendanceHistory.map((record, index) => (
                    <tr key={index}>
                      <td>{record.date}</td>

                      <td>{record.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default StudentDashboard;
