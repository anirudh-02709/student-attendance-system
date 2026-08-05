import { useEffect, useState } from "react";
import "../css/style.css";
import {
  getStudents,
  addStudent,
  deleteStudent,
  updateStudent,
} from "../services/api";
import Navbar from "../components/Navbar";

const emptyStudent = {
  name: "",
  usn: "",
  branch: "",
  year: "",
  password: "",
};

function Students() {
  const [students, setStudents] = useState([]);
  const [student, setStudent] = useState(emptyStudent);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUsn, setEditingUsn] = useState("");

  async function loadStudents() {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const resetForm = () => {
    setStudent(emptyStudent);
    setIsEditMode(false);
    setEditingUsn("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setStudent((prevStudent) => ({
      ...prevStudent,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        const updatePayload = {
          name: student.name,
          branch: student.branch,
          year: Number(student.year),
        };

        if (student.password && student.password.trim()) {
          updatePayload.password = student.password;
        }

        await updateStudent(editingUsn, updatePayload);
      } else {
        await addStudent({
          ...student,
          year: Number(student.year),
        });
      }

      resetForm();
      await loadStudents();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (selectedStudent) => {
    setStudent({
      name: selectedStudent.name,
      usn: selectedStudent.usn,
      branch: selectedStudent.branch,
      year: selectedStudent.year,
      password: "",
    });
    setIsEditMode(true);
    setEditingUsn(selectedStudent.usn);
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleDelete = async (usn) => {
    if (!window.confirm("Delete this student?")) {
      return;
    }

    try {
      await deleteStudent(usn);

      if (isEditMode && editingUsn === usn) {
        resetForm();
      }

      await loadStudents();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <Navbar />
      <main className="container">
        <section className="page-header">
          <div>
            <p className="eyebrow">Management</p>
            <h1>Students</h1>
          </div>
        </section>

        <section className="card form-card">
          <h2>{isEditMode ? "Edit Student" : "Add Student"}</h2>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              <span>Name</span>

              <input
                name="name"
                value={student.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </label>

            <label>
              <span>USN</span>

              <input
                name="usn"
                value={student.usn}
                onChange={handleChange}
                placeholder="1AH22CS001"
                required
                readOnly={isEditMode}
              />
            </label>

            <label>
              <span>Branch</span>

              <input
                name="branch"
                value={student.branch}
                onChange={handleChange}
                placeholder="CSE"
                required
              />
            </label>

            <label>
              <span>Year</span>

              <input
                name="year"
                type="number"
                min="1"
                max="4"
                value={student.year}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              <span>{isEditMode ? "New Password" : "Password"}</span>

              <input
                name="password"
                type="password"
                value={student.password}
                onChange={handleChange}
                placeholder={isEditMode ? "Leave empty to keep current password" : "Password"}
                required={!isEditMode}
              />
            </label>

            <div className="field full-width">
              <div className="button-row">
                <button className="btn primary" type="submit">
                  {isEditMode ? "Update Student" : "Add Student"}
                </button>

                {isEditMode && (
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </section>

        <section className="card table-card">
          <h2>Student List</h2>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>USN</th>
                  <th>Branch</th>
                  <th>Year</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="5">No students found.</td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.usn}>
                      <td>{s.name}</td>
                      <td>{s.usn}</td>
                      <td>{s.branch}</td>
                      <td>{s.year}</td>
                      <td>
                        <div className="button-row">
                          <button
                            className="btn secondary"
                            type="button"
                            onClick={() => handleEdit(s)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn danger"
                            type="button"
                            onClick={() => handleDelete(s.usn)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

export default Students;
