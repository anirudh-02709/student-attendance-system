// Student management page logic.
const studentForm = document.getElementById("studentForm");
const studentTableBody = document.getElementById("studentTableBody");
const marksModal = document.getElementById("marksModal");
const closeMarksModalBtn = document.getElementById("closeMarksModal");
const cancelMarksModalBtn = document.getElementById("cancelMarksModal");
const modalStudentName = document.getElementById("modalStudentName");
const modalStudentDetails = document.getElementById("modalStudentDetails");
const marksGrid = document.getElementById("marksGrid");
const marksForm = document.getElementById("marksForm");
const marksStatusMessage = document.getElementById("marksStatusMessage");

const SUPPORTED_SUBJECTS = ["DBMS", "DSA", "OS", "Java", "Computer Networks"];
let currentStudent = null;
let currentMarksState = {};
let loadedStudentsList = [];

function renderStudents(students) {
  if (!studentTableBody) return;

  loadedStudentsList = students;
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
      <td>
        <div class="button-row">
          <button class="btn secondary" data-action="marks" data-usn="${student.usn}" type="button">Marks</button>
          <button class="btn danger" data-action="delete" data-usn="${student.usn}" type="button">Delete</button>
        </div>
      </td>
    `;
    studentTableBody.appendChild(row);
  });
}

function openMarksModal(studentUsn) {
  currentStudent = loadedStudentsList.find((s) => s.usn === studentUsn) || { usn: studentUsn, name: studentUsn, branch: "-", year: "-" };
  const existingMarks = currentStudent.marks || {};

  currentMarksState = {};
  SUPPORTED_SUBJECTS.forEach((subject) => {
    const hasUploadedMark = Object.prototype.hasOwnProperty.call(existingMarks, subject) && existingMarks[subject] !== null;
    currentMarksState[subject] = {
      value: hasUploadedMark ? String(existingMarks[subject]) : "",
      isUploaded: hasUploadedMark,
    };
  });

  if (modalStudentName) modalStudentName.textContent = currentStudent.name || currentStudent.usn;
  if (modalStudentDetails) {
    modalStudentDetails.textContent = `USN: ${currentStudent.usn} | Branch: ${currentStudent.branch || "-"} | Year: ${currentStudent.year || "-"}`;
  }

  renderMarksGrid();
  if (marksStatusMessage) marksStatusMessage.style.display = "none";
  if (marksModal) marksModal.style.display = "flex";
}

function closeMarksModal() {
  if (marksModal) marksModal.style.display = "none";
  currentStudent = null;
}

function renderMarksGrid() {
  if (!marksGrid) return;
  marksGrid.innerHTML = "";

  SUPPORTED_SUBJECTS.forEach((subject) => {
    const stateObj = currentMarksState[subject];
    const card = document.createElement("div");
    card.className = "marks-subject-card";

    card.innerHTML = `
      <div class="subject-card-header">
        <span class="subject-title">${subject}</span>
        <span class="badge ${stateObj.isUploaded ? "status-badge-uploaded" : "status-badge-new"}">
          ${stateObj.isUploaded ? "✓ Uploaded (Update)" : "▲ Pending Upload"}
        </span>
      </div>
      <div class="subject-input-row">
        <input
          type="number"
          min="0"
          max="100"
          data-subject="${subject}"
          value="${stateObj.value}"
          placeholder="${stateObj.isUploaded ? "Enter new marks to update" : "Enter marks to upload"}"
        />
      </div>
      <p class="action-hint">${stateObj.isUploaded ? "Action: Update existing record" : "Action: Initial upload for subject"}</p>
    `;

    const input = card.querySelector("input");
    input.addEventListener("input", (e) => {
      currentMarksState[subject].value = e.target.value;
    });

    marksGrid.appendChild(card);
  });
}

marksForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const uploadPayload = {};
  const updatePayload = {};
  const uploadSubjects = [];
  const updateSubjects = [];
  const errors = [];

  SUPPORTED_SUBJECTS.forEach((subject) => {
    const stateObj = currentMarksState[subject];
    const valStr = (stateObj.value || "").trim();

    if (valStr !== "") {
      const num = Number(valStr);
      if (isNaN(num) || num < 0 || num > 100) {
        errors.push(`${subject}: Marks must be between 0 and 100`);
        return;
      }

      if (stateObj.isUploaded) {
        updatePayload[subject] = num;
        updateSubjects.push(subject);
      } else {
        uploadPayload[subject] = num;
        uploadSubjects.push(subject);
      }
    }
  });

  if (errors.length > 0) {
    showMarksStatus(errors.join(" | "), true);
    return;
  }

  if (uploadSubjects.length === 0 && updateSubjects.length === 0) {
    showMarksStatus("No new or modified marks entered to submit.", false);
    return;
  }

  showMarksStatus("Submitting marks to backend...", false);

  try {
    if (uploadSubjects.length > 0) {
      await uploadStudentMarks(currentStudent.usn, uploadPayload);
    }
    if (updateSubjects.length > 0) {
      await updateStudentMarks(currentStudent.usn, updatePayload);
    }

    // Update local state: newly uploaded subjects become isUploaded = true
    uploadSubjects.forEach((sub) => {
      currentMarksState[sub].isUploaded = true;
    });

    if (currentStudent) {
      if (!currentStudent.marks) currentStudent.marks = {};
      Object.assign(currentStudent.marks, uploadPayload, updatePayload);
    }

    renderMarksGrid();

    const summary = [];
    if (uploadSubjects.length > 0) summary.push(`Uploaded: ${uploadSubjects.join(", ")}`);
    if (updateSubjects.length > 0) summary.push(`Updated: ${updateSubjects.join(", ")}`);

    showMarksStatus(`Batch action complete! ${summary.join(" | ")}`, false);
  } catch (error) {
    showMarksStatus(error.message || "Failed to submit marks.", true);
  }
});


function showMarksStatus(msg, isError) {
  if (!marksStatusMessage) return;
  marksStatusMessage.textContent = msg;
  marksStatusMessage.style.display = "block";
  marksStatusMessage.style.color = isError ? "var(--danger)" : "var(--accent)";
}

closeMarksModalBtn?.addEventListener("click", closeMarksModal);
cancelMarksModalBtn?.addEventListener("click", closeMarksModal);

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
    password: formData.get("password"),
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

  const action = button.getAttribute("data-action");
  const studentUsn = button.getAttribute("data-usn");

  if (action === "marks") {
    openMarksModal(studentUsn);
  } else if (action === "delete") {
    try {
      await deleteStudent(studentUsn);
      await refreshStudents();
    } catch (error) {
      console.error("Failed to delete student.", error);
    }
  }
});

refreshStudents();
