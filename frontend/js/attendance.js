// Attendance page logic.
const attendanceForm = document.getElementById("attendanceForm");
const attendanceList = document.getElementById("attendanceList");
const statusMessage = document.getElementById("statusMessage");
const attendanceDateInput = document.getElementById("attendanceDate");

function renderAttendanceStudents(students) {
  if (!attendanceList) return;

  attendanceList.innerHTML = "";

  students.forEach((student) => {
    const listItem = document.createElement("li");
    listItem.dataset.usn = student.usn;
    listItem.innerHTML = `
      <label>
        <span>${student.name} (${student.usn})</span>
      </label>
      <select>
        <option value="Present">Present</option>
        <option value="Absent">Absent</option>
      </select>
    `;
    attendanceList.appendChild(listItem);
  });
}

async function loadAttendanceStudents() {
  const students = await getStudents();
  renderAttendanceStudents(students);
}

attendanceForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!attendanceList) return;

  const date = attendanceDateInput?.value || new Date().toISOString().slice(0, 10);
  const markedAt = new Date().toISOString();
  const students = Array.from(attendanceList.querySelectorAll("li"));

  try {
    await Promise.all(
      students.map((item) => {
        const studentUsn = item.dataset.usn;
        const status = item.querySelector("select")?.value || "Present";
        return markAttendance({
          studentUsn,
          date,
          markedAt,
          status,
        });
      })
    );

    statusMessage.hidden = false;
    statusMessage.textContent = "Attendance saved successfully.";
  } catch (error) {
    statusMessage.hidden = false;
    statusMessage.textContent = "Unable to save attendance. Please try again.";
    console.error("Failed to save attendance.", error);
  }
});

loadAttendanceStudents();
