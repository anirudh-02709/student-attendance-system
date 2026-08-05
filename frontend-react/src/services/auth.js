export function logout(navigate) {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("username");

  navigate("/");
}