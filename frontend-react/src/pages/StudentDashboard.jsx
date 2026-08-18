import { useEffect, useState } from "react";
import "../css/style.css";
import { getStudentDashboard, markAttendance } from "../services/api";
import StudentNavbar from "../components/StudentNavbar";
import Footer from "../components/Footer";
import LoadingState from "../components/LoadingState";
import StudentAnnouncementsSection from "../components/StudentAnnouncementsSection";

function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [marks, setMarks] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await getStudentDashboard();

        setStudent(data.student);
        setAttendance(data.attendance);
        setMarks(data.marks || {});
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

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

      const data = await getStudentDashboard();
      setStudent(data.student);
      setAttendance(data.attendance);
      setMarks(data.marks || {});
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

  const hasMarks = marks && Object.keys(marks).length > 0;

  return (
    <>
      <StudentNavbar />

      <main className="container">
        <section className="page-header">
          <div>
            <p className="eyebrow">Student</p>
            <h1>Welcome {student.name}</h1>
            <p className="page-subtitle">
              Keep track of your attendance record and view your subject marks.
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

        <StudentAnnouncementsSection />

        <section className="card table-card" style={{ marginBottom: "1.2rem" }}>
          <div className="section-heading">
            <h2>Academic Marks</h2>
            <p>Review your marks across subjects recorded by faculty.</p>
          </div>

          <div className="table-wrapper">
            {!hasMarks ? (
              <div className="empty-state">
                No marks have been uploaded by your faculty yet.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Marks</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {Object.entries(marks).map(([subject, mark]) => (
                    <tr key={subject}>
                      <td><strong>{subject}</strong></td>
                      <td>{mark}</td>
                      <td>
                        <span className="badge status-badge-uploaded">
                          ✓ Uploaded
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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

