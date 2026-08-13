import { useState } from "react";
import { uploadStudentMarks, updateStudentMarks } from "../services/api";

const SUPPORTED_SUBJECTS = [
  "DBMS",
  "DSA",
  "OS",
  "Java",
  "Computer Networks",
];

function MarksModal({ student, onClose, onSaveMarks }) {
  // Initialize marks state for supported subjects
  // Initial state maps subject -> { value: number|string, isUploaded: boolean }
  const [marksState, setMarksState] = useState(() => {
    const existingMarks = student?.marks || {};
    const initial = {};

    SUPPORTED_SUBJECTS.forEach((subject) => {
      const hasUploadedMark =
        Object.prototype.hasOwnProperty.call(existingMarks, subject) &&
        existingMarks[subject] !== null &&
        existingMarks[subject] !== undefined;

      initial[subject] = {
        value: hasUploadedMark ? String(existingMarks[subject]) : "",
        isUploaded: hasUploadedMark,
      };
    });

    return initial;
  });

  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("info"); // "info" | "success" | "error"
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!student) return null;

  const handleMarkChange = (subject, value) => {
    setMarksState((prev) => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        value: value,
      },
    }));
  };

  const handleSingleSubjectAction = async (subject) => {
    if (isSubmitting) return;

    const currentSubjectState = marksState[subject];
    const markVal = currentSubjectState.value.trim();

    if (markVal === "") {
      setStatusMessage(`Please enter valid marks for ${subject}.`);
      setStatusType("error");
      return;
    }

    const numericMark = Number(markVal);
    if (isNaN(numericMark) || numericMark < 0 || numericMark > 100) {
      setStatusMessage(`Marks for ${subject} must be between 0 and 100.`);
      setStatusType("error");
      return;
    }

    const isUpdate = currentSubjectState.isUploaded;
    const actionLabel = isUpdate ? "Updated" : "Uploaded";
    const payload = { [subject]: numericMark };

    setIsSubmitting(true);
    setStatusMessage(`Submitting ${subject} marks...`);
    setStatusType("info");

    try {
      if (isUpdate) {
        // PUT /students/{usn}/marks
        await updateStudentMarks(student.usn, payload);
      } else {
        // POST /students/{usn}/marks
        await uploadStudentMarks(student.usn, payload);
      }

      const updatedState = {
        ...marksState,
        [subject]: {
          value: String(numericMark),
          isUploaded: true,
        },
      };

      setMarksState(updatedState);

      if (onSaveMarks) {
        onSaveMarks(student.usn, payload);
      }

      setStatusMessage(`Successfully ${actionLabel.toLowerCase()} marks for ${subject} (${numericMark}).`);
      setStatusType("success");
    } catch (error) {
      const errorMsg = error.message || `Failed to ${isUpdate ? "update" : "upload"} marks for ${subject}.`;
      setStatusMessage(errorMsg);
      setStatusType("error");

      // If POST failed because marks were already uploaded, update state to isUploaded = true
      if (!isUpdate && errorMsg.toLowerCase().includes("already uploaded")) {
        setMarksState((prev) => ({
          ...prev,
          [subject]: {
            ...prev[subject],
            isUploaded: true,
          },
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAll = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const uploadPayload = {};
    const updatePayload = {};
    const uploadSubjects = [];
    const updateSubjects = [];
    const errors = [];

    SUPPORTED_SUBJECTS.forEach((subject) => {
      const stateObj = marksState[subject];
      const valStr = stateObj.value.trim();

      if (valStr !== "") {
        const num = Number(valStr);
        if (isNaN(num) || num < 0 || num > 100) {
          errors.push(`${subject}: Marks must be 0-100`);
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
      setStatusMessage(errors.join(" | "));
      setStatusType("error");
      return;
    }

    if (uploadSubjects.length === 0 && updateSubjects.length === 0) {
      setStatusMessage("No new or modified marks entered to submit.");
      setStatusType("info");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("Submitting marks to backend...");
    setStatusType("info");

    try {
      // 1. Send initial upload via POST /students/{usn}/marks for new subjects
      if (uploadSubjects.length > 0) {
        await uploadStudentMarks(student.usn, uploadPayload);
      }

      // 2. Send updates via PUT /students/{usn}/marks for existing subjects
      if (updateSubjects.length > 0) {
        await updateStudentMarks(student.usn, updatePayload);
      }

      // Transition uploaded subjects to isUploaded = true
      const nextState = { ...marksState };
      uploadSubjects.forEach((sub) => {
        nextState[sub] = {
          ...nextState[sub],
          isUploaded: true,
        };
      });

      setMarksState(nextState);

      const combinedPayload = { ...uploadPayload, ...updatePayload };
      if (onSaveMarks) {
        onSaveMarks(student.usn, combinedPayload);
      }

      const actionSummary = [];
      if (uploadSubjects.length > 0) {
        actionSummary.push(`Uploaded: ${uploadSubjects.join(", ")}`);
      }
      if (updateSubjects.length > 0) {
        actionSummary.push(`Updated: ${updateSubjects.join(", ")}`);
      }

      setStatusMessage(`Batch action complete! ${actionSummary.join(" | ")}`);
      setStatusType("success");
    } catch (error) {
      setStatusMessage(error.message || "Failed to submit marks.");
      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="marksModalTitle"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Faculty Marks Management</p>
            <h2 id="marksModalTitle">{student.name}</h2>
            <p className="modal-subtitle">
              USN: <strong>{student.usn}</strong> | Branch: <strong>{student.branch}</strong> | Year: <strong>{student.year}</strong>
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmitAll}>
          <div className="marks-grid">
            {SUPPORTED_SUBJECTS.map((subject) => {
              const { value, isUploaded } = marksState[subject];

              return (
                <div className="marks-subject-card" key={subject}>
                  <div className="subject-card-header">
                    <span className="subject-title">{subject}</span>
                    <span
                      className={`badge ${
                        isUploaded
                          ? "status-badge-uploaded"
                          : "status-badge-new"
                      }`}
                    >
                      {isUploaded ? "✓ Uploaded (Update)" : "▲ Pending Upload"}
                    </span>
                  </div>

                  <div className="subject-input-row">
                    <label className="marks-input-label">
                      <span className="sr-only">Marks for {subject}</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(e) =>
                          handleMarkChange(subject, e.target.value)
                        }
                        placeholder={
                          isUploaded ? "Enter new marks" : "Enter marks"
                        }
                        disabled={isSubmitting}
                      />
                    </label>

                    <button
                      type="button"
                      className={`btn ${
                        isUploaded ? "secondary" : "primary"
                      } btn-compact subject-action-btn`}
                      onClick={() => handleSingleSubjectAction(subject)}
                      disabled={isSubmitting}
                    >
                      {isUploaded ? "Update" : "Upload"}
                    </button>
                  </div>
                  <p className="action-hint">
                    {isUploaded
                      ? "Action: Update existing record (PUT)"
                      : "Action: Initial upload for subject (POST)"}
                  </p>
                </div>
              );
            })}
          </div>

          {statusMessage && (
            <p
              className={`status-message ${
                statusType === "error"
                  ? "status-error"
                  : statusType === "success"
                  ? "status-success"
                  : ""
              }`}
            >
              {statusMessage}
            </p>
          )}

          <div className="modal-actions">
            <button
              className="btn primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Submitting Marks..."
                : "Upload & Update All Entered Marks"}
            </button>
            <button
              className="btn secondary"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MarksModal;
