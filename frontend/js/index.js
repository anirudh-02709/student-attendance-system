// Dashboard page logic.
async function loadDashboard() {
  try {
    const [students, attendanceRecords] = await Promise.all([
      requestJson("http://localhost:8080/students"),
      requestJson("http://localhost:8080/attendance"),
    ]);

    const totalStudents = Array.isArray(students) ? students.length : 0;

    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const presentToday = Array.isArray(attendanceRecords)
      ? attendanceRecords.filter(
          (record) =>
            record.status === "Present" &&
            record.date === todayKey
        ).length
      : 0;

    const attendancePercentage =
      totalStudents > 0
        ? Math.round((presentToday / totalStudents) * 100)
        : 0;

    document.querySelector("[data-total-students]").textContent = totalStudents;
    document.querySelector("[data-present-today]").textContent = presentToday;
    document.querySelector("[data-attendance-percent]").textContent =
      `${attendancePercentage}%`;

  } catch (error) {
    console.error("Unable to load dashboard data.", error);
  }
}

window.loadDashboard = loadDashboard;
loadDashboard();