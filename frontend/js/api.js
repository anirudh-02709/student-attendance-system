// Shared API helpers for the attendance frontend.
const API_BASE_URL = "http://localhost:8080/";

async function requestJson(url, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "login.html";
    return;
  }

  if (!response.ok) {
    let message = "Unable to complete the request.";

    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch {
      try {
        message = await response.text();
      } catch {
        message = response.statusText || message;
      }
    }

    throw new Error(message);
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function getStudents() {
  try {
    return await requestJson(`${API_BASE_URL}students`);
  } catch (error) {
    console.error("Unable to load students.", error);
    return [];
  }
}

async function addStudent(student) {
  try {
    return await requestJson(`${API_BASE_URL}students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(student),
    });
  } catch (error) {
    console.error("Unable to add student.", error);
    throw error;
  }
}

async function deleteStudent(usn) {
  try {
    await requestJson(`${API_BASE_URL}students/${encodeURIComponent(usn)}`, {
      method: "DELETE",
    });
    return true;
  } catch (error) {
    console.error("Unable to delete student.", error);
    throw error;
  }
}

async function getAttendance() {
  try {
    return await requestJson(`${API_BASE_URL}attendance`);
  } catch (error) {
    console.error("Unable to load attendance.", error);
    return [];
  }
}

function getDateKey(value) {
  if (!value) return null;

  if (value instanceof Date) {
    const normalized = new Date(
      value.getTime() - value.getTimezoneOffset() * 60000
    );
    return normalized.toISOString().slice(0, 10);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);

    if (!Number.isNaN(parsed.getTime())) {
      const normalized = new Date(
        parsed.getTime() - parsed.getTimezoneOffset() * 60000
      );
      return normalized.toISOString().slice(0, 10);
    }
  }

  return null;
}

function getTodayKey() {
  const now = new Date();
  const normalized = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  );
  return normalized.toISOString().slice(0, 10);
}

async function getDashboard() {
  try {
    const [students, attendanceRecords] = await Promise.all([
      getStudents(),
      requestJson(`${API_BASE_URL}attendance`),
    ]);

    const totalStudents = Array.isArray(students) ? students.length : 0;
    const today = getTodayKey();

    const presentToday = Array.isArray(attendanceRecords)
      ? attendanceRecords.filter((record) => {
          const recordDate =
            getDateKey(record.date) || getDateKey(record.markedAt);

          return recordDate === today && record.status === "Present";
        }).length
      : 0;

    const attendancePercentage =
      totalStudents > 0
        ? Math.round((presentToday / totalStudents) * 100)
        : 0;

    return {
      totalStudents,
      presentToday,
      attendancePercentage,
    };
  } catch (error) {
    console.error("Unable to load dashboard data.", error);

    return {
      totalStudents: 0,
      presentToday: 0,
      attendancePercentage: 0,
    };
  }
}

async function loadDashboard() {
  const data = await getDashboard();

  const totalStudentsElement = document.querySelector(
    "[data-total-students]"
  );
  const presentTodayElement = document.querySelector(
    "[data-present-today]"
  );
  const attendancePercentElement = document.querySelector(
    "[data-attendance-percent]"
  );

  if (totalStudentsElement) {
    totalStudentsElement.textContent = data.totalStudents ?? 0;
  }

  if (presentTodayElement) {
    presentTodayElement.textContent = data.presentToday ?? 0;
  }

  if (attendancePercentElement) {
    attendancePercentElement.textContent = `${
      data.attendancePercentage ?? 0
    }%`;
  }
}

window.getDashboard = getDashboard;
window.loadDashboard = loadDashboard;

if (
  document.querySelector("[data-total-students]") &&
  document.querySelector("[data-present-today]") &&
  document.querySelector("[data-attendance-percent]")
) {
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        loadDashboard();
      },
      { once: true }
    );
  } else {
    loadDashboard();
  }
}

async function markAttendance(data) {
  try {
    return await requestJson(`${API_BASE_URL}attendance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Unable to submit attendance.", error);
    throw error;
  }
}

async function getCurrentStudent() {
  try {
    return await requestJson(`${API_BASE_URL}student/me`);
  } catch (error) {
    console.error("Unable to load student profile.", error);
    throw error;
  }
}

async function getCurrentStudentAttendance() {
  try {
    return await requestJson(`${API_BASE_URL}student/me/attendance`);
  } catch (error) {
    console.error("Unable to load student attendance.", error);
    throw error;
  }
}
