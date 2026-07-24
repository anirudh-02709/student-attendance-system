// Student management page logic.
const studentForm = document.getElementById("studentForm");
const studentTableBody = document.getElementById("studentTableBody");

function renderStudents(students) {
  if (!studentTableBody) return;

  studentTableBody.innerHTML = "";

  if (!students.length) {
    studentTableBody.innerHTML = '<tr><td colspan="5">No students found.</td></tr>';
    return;
  }

  students.forEach((student) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.name}</td>
      <td>${student.usn}</td>
      <td>${student.branch}</td>
      <td>${student.year}</td>
      <td><button class="btn danger" data-usn="${student.usn}" type="button">Delete</button></td>
    `;
    studentTableBody.appendChild(row);
  });
}

async function refreshStudents() {
  const students = await getStudents();
  renderStudents(students);
}

studentForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(studentForm);
  const student = {
    name: formData.get("name"),
    usn: formData.get("usn"),
    branch: formData.get("branch"),
    year: Number(formData.get("year")),
  };

  try {
    await addStudent(student);
    studentForm.reset();
    await refreshStudents();
  } catch (error) {
    console.error("Failed to add student.", error);
  }
});

studentTableBody?.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-usn]");
  if (!button) return;

  const studentUsn = button.getAttribute("data-usn");
  try {
    await deleteStudent(studentUsn);
    await refreshStudents();
  } catch (error) {
    console.error("Failed to delete student.", error);
  }
});

refreshStudents();
