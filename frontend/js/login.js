const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    errorMessage.textContent = "";

    try {
        const response = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        if (!response.ok) {
            throw new Error("Invalid username or password");
        }

        const data = await response.json();

        localStorage.setItem("token", data.token);

        window.location.href = "index.html";

    } catch (error) {
        errorMessage.textContent = error.message;
    }
});