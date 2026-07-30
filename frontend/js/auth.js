function requireAuth(requiredRole) {

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    if (requiredRole && role !== requiredRole) {
        window.location.href = role === "STUDENT" ? "student-dashboard.html" : "index.html";
    }

}
