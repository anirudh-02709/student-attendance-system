const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");
const loginMode = document.getElementById("loginMode");
const loginTitle = document.getElementById("loginTitle");
const usernameLabel = document.getElementById("usernameLabel");
const usernameInput = document.getElementById("username");

function updateLoginMode() {
    const isStudentLogin = loginMode.value === "student";

    loginTitle.textContent = isStudentLogin ? "Student Login" : "Faculty Login";
    usernameLabel.textContent = isStudentLogin ? "USN" : "Username";
    usernameInput.placeholder = isStudentLogin ? "Enter USN" : "Enter username";
}

loginMode.addEventListener("change", updateLoginMode);
updateLoginMode();

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const isStudentLogin = loginMode.value === "student";
    const loginUrl = isStudentLogin
        ? "http://localhost:8080/student/login"
        : "http://localhost:8080/auth/login";

    errorMessage.textContent = "";

    try {
        const response = await fetch(loginUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(isStudentLogin
                ? { usn: username, password }
                : { username, password })
        });

        if (!response.ok) {
            throw new Error(isStudentLogin ? "Invalid USN or password" : "Invalid username or password");
        }

        const data = await response.json();

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", data.username);

        window.location.href = data.role === "STUDENT" ? "student-dashboard.html" : "index.html";

    } catch (error) {
        errorMessage.textContent = error.message;
    }
});
