import { useEffect, useRef, useState } from "react";
import "../css/style.css";
import {
  getStudents,
  getAttendanceByDate,
  markAttendance,
} from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingState from "../components/LoadingState";

function Attendance() {
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    const loadStudentsForDate = async () => {
      try {
        const [studentData, attendanceData] = await Promise.all([
          getStudents(),
          getAttendanceByDate(date),
        ]);

        if (requestId !== requestIdRef.current) {
          return;
        }

        const attendanceMap = new Map(
          (attendanceData ?? []).map((record) => [
            record.studentUsn,
            record.status,
          ])
        );

        const mergedStudents = studentData.map((student) => {
          const existingStatus = attendanceMap.get(student.usn);

          if (existingStatus) {
            return {
              ...student,
              status: existingStatus,
              isMarked: true,
            };
          }

          return {
            ...student,
            status: "Present",
            isMarked: false,
          };
        });

        setStudents(mergedStudents);
        setStatusMessage("");
        setIsLoading(false);
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        console.error(error);
        setStatusMessage(error.message);
        setIsLoading(false);
      }
    };

    loadStudentsForDate();
  }, [date]);

  const handleStatusChange = (index, value) => {
    const updated = [...students];
    updated[index].status = value;
    setStudents(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    const pendingStudents = students.filter(
      (student) => !student.isMarked
    );

    if (pendingStudents.length === 0) {
      setStatusMessage(
        "All students have already been marked for this date."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await Promise.all(
        pendingStudents.map((student) =>
          markAttendance({
            studentUsn: student.usn,
            date,
            status: student.status,
          })
        )
      );

      const requestId = ++requestIdRef.current;

      const [studentData, attendanceData] = await Promise.all([
        getStudents(),
        getAttendanceByDate(date),
      ]);

      if (requestId !== requestIdRef.current) {
        return;
      }

      const attendanceMap = new Map(
        (attendanceData ?? []).map((record) => [
          record.studentUsn,
          record.status,
        ])
      );

      const mergedStudents = studentData.map((student) => {
        const existingStatus = attendanceMap.get(student.usn);

        if (existingStatus) {
          return {
            ...student,
            status: existingStatus,
            isMarked: true,
          };
        }

        return {
          ...student,
          status: "Present",
          isMarked: false,
        };
      });

      setStudents(mergedStudents);
      setStatusMessage("Attendance saved successfully.");
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allStudentsMarked =
    students.length > 0 &&
    students.every((student) => student.isMarked);

  return (
    <>
      <Navbar />

      <main className="container">
        <section className="page-header">
          <div>
            <p className="eyebrow">Attendance</p>
            <h1>Mark Daily Attendance</h1>
            <p className="page-subtitle">
              Record student attendance clearly for each day without disrupting your workflow.
            </p>
          </div>
        </section>

        <section className="card form-card">
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              <span>Select Date</span>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </label>

            <div className="field full-width">
              <button
                className="btn primary"
                type="submit"
                disabled={allStudentsMarked || isSubmitting}
              >
                {isSubmitting
                  ? "Submitting..."
                  : "Submit Attendance"}
              </button>
            </div>
          </form>
        </section>

        <section className="card table-card">
          <div className="section-heading">
            <h2>Students</h2>
            <p>Review the attendance list for the selected date.</p>
          </div>

          {isLoading ? (
            <LoadingState type="list" />
          ) : students.length === 0 ? (
            <div className="empty-state">No students are available to display for the selected date.</div>
          ) : (
            <ul className="student-list">
              {students.map((student, index) => (
                <li key={student.usn}>
                  <label>
                    <span>
                      {student.name} ({student.usn})
                    </span>
                  </label>

                  {student.isMarked ? (
                    <span className="badge status-chip">
                      ✓ Already Marked ({student.status})
                    </span>
                  ) : (
                    <select
                      value={student.status}
                      onChange={(e) =>
                        handleStatusChange(index, e.target.value)
                      }
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                    </select>
                  )}
                </li>
              ))}
            </ul>
          )}

          {allStudentsMarked && (
            <p className="status-message">
              All students have already been marked for this date.
            </p>
          )}

          {statusMessage && !allStudentsMarked && (
            <p className="status-message">
              {statusMessage}
            </p>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Attendance;