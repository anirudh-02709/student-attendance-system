const API_BASE_URL = "http://localhost:8080";

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
    localStorage.removeItem("role");
    localStorage.removeItem("username");

    throw new Error("Session expired. Please login again.");
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

// ---------------------- LOGIN ----------------------

export async function login(loginMode, username, password) {
  const loginUrl =
    loginMode === "student"
      ? `${API_BASE_URL}/student/login`
      : `${API_BASE_URL}/auth/login`;

  const response = await fetch(loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      loginMode === "student"
        ? { usn: username, password }
        : { username, password }
    ),
  });

  if (!response.ok) {
    throw new Error(
      loginMode === "student"
        ? "Invalid USN or Password"
        : "Invalid Username or Password"
    );
  }

  return await response.json();
}

// ---------------------- STUDENTS ----------------------

export async function getStudents() {
  return await requestJson(`${API_BASE_URL}/students`);
}

export async function addStudent(student) {
  return await requestJson(`${API_BASE_URL}/students`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(student),
  });
}

export async function deleteStudent(usn) {
  return await requestJson(
    `${API_BASE_URL}/students/${encodeURIComponent(usn)}`,
    {
      method: "DELETE",
    }
  );
}

export async function updateStudent(usn, student) {
  const payload = {
    name: student.name,
    branch: student.branch,
    year: student.year,
    ...(student.password && student.password.trim()
      ? { password: student.password }
      : {}),
  };

  return await requestJson(
    `${API_BASE_URL}/students/${encodeURIComponent(usn)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
}

// ---------------------- ATTENDANCE ----------------------

export async function getAttendance() {
  return await requestJson(`${API_BASE_URL}/attendance`);
}

export async function getAttendanceByDate(date) {
  return await requestJson(`${API_BASE_URL}/attendance?date=${date}`);
}

export async function markAttendance(data) {
  return await requestJson(`${API_BASE_URL}/attendance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

// ---------------------- STUDENT ----------------------

export async function getCurrentStudent() {
  return await requestJson(`${API_BASE_URL}/student/me`);
}

export async function getCurrentStudentAttendance() {
  return await requestJson(`${API_BASE_URL}/student/me/attendance`);
}

export async function getDashboard() {
  const [students, attendanceRecords] = await Promise.all([
    getStudents(),
    getAttendance(),
  ]);

  const totalStudents = Array.isArray(students) ? students.length : 0;

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

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

  return {
    totalStudents,
    presentToday,
    attendancePercentage,
  };
}

export async function getStudentDashboard() {
  const [student, attendance] = await Promise.all([
    getCurrentStudent(),
    getCurrentStudentAttendance(),
  ]);

  return {
    student,
    attendance,
  };
}