const studentWelcome = document.querySelector("[data-student-welcome]");
const attendancePercent = document.querySelector("[data-student-attendance-percent]");
const presentCount = document.querySelector("[data-student-present-count]");
const absentCount = document.querySelector("[data-student-absent-count]");
const attendanceTableBody = document.getElementById("studentAttendanceTableBody");
const markAttendanceBtn = document.getElementById("markAttendanceBtn");
const attendanceStatusMessage = document.getElementById("attendanceStatusMessage");

function renderAttendanceHistory(records) {
  if (!attendanceTableBody) return;

  attendanceTableBody.innerHTML = "";

  if (!records.length) {
    attendanceTableBody.innerHTML = '<tr><td colspan="2">No attendance records found.</td></tr>';
    return;
  }

  records.forEach((record) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${record.date}</td>
      <td>${record.status}</td>
    `;
    attendanceTableBody.appendChild(row);
  });
}

const studentMarksTable = document.getElementById("studentMarksTable");
const studentMarksTableBody = document.getElementById("studentMarksTableBody");
const studentMarksEmptyState = document.getElementById("studentMarksEmptyState");

function renderStudentMarks(marks) {
  if (!studentMarksTable || !studentMarksTableBody || !studentMarksEmptyState) return;

  const entries = Object.entries(marks || {});

  if (!entries.length) {
    studentMarksTable.style.display = "none";
    studentMarksEmptyState.style.display = "block";
    return;
  }

  studentMarksTableEmptyStateDisplay(entries);
}

function studentMarksTableEmptyStateDisplay(entries) {
  studentMarksEmptyState.style.display = "none";
  studentMarksTable.style.display = "table";
  studentMarksTableBody.innerHTML = "";

  entries.forEach(([subject, mark]) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${subject}</strong></td>
      <td>${mark}</td>
      <td><span class="badge status-badge-uploaded">✓ Uploaded</span></td>
    `;
    studentMarksTableBody.appendChild(row);
  });
}

async function loadStudentDashboard() {
  try {
    const [student, attendance, marks] = await Promise.all([
      getCurrentStudent(),
      getCurrentStudentAttendance(),
      getStudentMarks().catch(() => ({})),
    ]);

    if (studentWelcome) {
      studentWelcome.textContent = `Welcome ${student.name}`;
    }

    if (attendancePercent) {
      attendancePercent.textContent = `${attendance.attendancePercentage ?? 0}%`;
    }

    if (presentCount) {
      presentCount.textContent = attendance.presentCount ?? 0;
    }

    if (absentCount) {
      absentCount.textContent = attendance.absentCount ?? 0;
    }

    renderAttendanceHistory(attendance.attendanceHistory || []);
    renderStudentMarks(marks || {});
  } catch (error) {
    console.error("Unable to load student dashboard.", error);
  }
}

loadStudentDashboard();


function getGeolocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(error.message || "Unable to retrieve your location."));
      }
    );
  });
}

markAttendanceBtn?.addEventListener("click", async () => {
  if (!attendanceStatusMessage) return;

  attendanceStatusMessage.hidden = true;
  markAttendanceBtn.disabled = true;

  try {
    const { latitude, longitude } = await getGeolocation();
    await markAttendance({ latitude, longitude });

    attendanceStatusMessage.hidden = false;
    attendanceStatusMessage.style.color = "var(--accent)";
    attendanceStatusMessage.textContent = "Attendance marked successfully.";

    await loadStudentDashboard();
  } catch (error) {
    attendanceStatusMessage.hidden = false;
    attendanceStatusMessage.style.color = "var(--danger)";
    attendanceStatusMessage.textContent =
      error.message || "Unable to mark attendance. Please try again.";
    console.error("Failed to mark attendance.", error);
  } finally {
    markAttendanceBtn.disabled = false;
  }
});
