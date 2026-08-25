import { useEffect, useState, useRef } from "react";
import {
  getHolidays,
  addHoliday,
  updateHoliday,
  deleteHoliday,
} from "../services/api";
import LoadingState from "./LoadingState";

const emptyHoliday = {
  name: "",
  date: "",
  description: "",
};

function HolidaySection() {
  const [holidays, setHolidays] = useState([]);
  const [formData, setFormData] = useState(emptyHoliday);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const formRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    getHolidays()
      .then((data) => {
        if (!isMounted) return;
        const items = Array.isArray(data) ? data : [];
        setHolidays(items);
        setIsLoading(false);
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error(error);
        setFeedback({
          type: "error",
          message: error.message || "Failed to load holidays.",
        });
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function loadHolidays() {
    try {
      setIsLoading(true);
      const data = await getHolidays();
      const items = Array.isArray(data) ? data : [];
      setHolidays(items);
    } catch (error) {
      console.error(error);
      setFeedback({
        type: "error",
        message: error.message || "Failed to load holidays.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyHoliday);
    setIsEditMode(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.date) {
      setFeedback({
        type: "error",
        message: "Holiday name and date are required.",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      const payload = {
        name: formData.name.trim(),
        date: formData.date,
        ...(formData.description && formData.description.trim()
          ? { description: formData.description.trim() }
          : {}),
      };

      if (isEditMode && editingId) {
        await updateHoliday(editingId, payload);
        setFeedback({
          type: "success",
          message: "Holiday updated successfully.",
        });
        resetForm();
        await loadHolidays();
      } else {
        await addHoliday(payload);
        setFeedback({
          type: "success",
          message: "Holiday added successfully.",
        });
        resetForm();
        await loadHolidays();
      }
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Failed to save holiday.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name || "",
      date: item.date || "",
      description: item.description || "",
    });
    setIsEditMode(true);
    setEditingId(item.id);
    setFeedback({ type: "", message: "" });

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCancelEdit = () => {
    resetForm();
    setFeedback({ type: "", message: "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holiday?")) {
      return;
    }

    try {
      await deleteHoliday(id);
      setFeedback({
        type: "success",
        message: "Holiday deleted successfully.",
      });

      if (isEditMode && editingId === id) {
        resetForm();
      }

      await loadHolidays();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Failed to delete holiday.",
      });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const isPastDate = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date().toISOString().slice(0, 10);
    return dateStr < today;
  };

  return (
    <section className="holidays-section" aria-labelledby="holidays-title">
      <div className="section-heading">
        <div>
          <h2 id="holidays-title">Holiday Management</h2>
          <p>Manage the shared institution-wide holiday calendar.</p>
        </div>
      </div>

      {feedback.message && (
        <div
          className={`status-message ${
            feedback.type === "error" ? "status-error" : "status-success"
          }`}
          role="alert"
          style={{ marginBottom: "1.2rem", marginTop: 0 }}
        >
          <span>{feedback.type === "error" ? "⚠" : "✓"}</span>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="card form-card holidays-form-card" ref={formRef}>
        <div className="section-heading">
          <h3>{isEditMode ? "Edit Holiday" : "Add New Holiday"}</h3>
          <p>
            {isEditMode
              ? "Modify the holiday details below."
              : "Declare a holiday date for the entire institution."}
          </p>
        </div>

        <form className="form-grid" onSubmit={handleSubmit} autoComplete="off">
          <label>
            <span>
              Holiday Name{" "}
              <span aria-hidden="true" style={{ color: "var(--danger)" }}>
                *
              </span>
            </span>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Republic Day"
              required
            />
          </label>

          <label>
            <span>
              Date{" "}
              <span aria-hidden="true" style={{ color: "var(--danger)" }}>
                *
              </span>
            </span>
            <input
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </label>

          <label className="full-width">
            <span>Description (Optional)</span>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Optional reason or details for this holiday..."
            />
          </label>

          <div className="field full-width">
            <div className="button-row">
              <button
                className="btn primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? isEditMode
                    ? "Updating..."
                    : "Adding..."
                  : isEditMode
                  ? "Update Holiday"
                  : "Add Holiday"}
              </button>

              {isEditMode && (
                <button
                  className="btn secondary"
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Holiday List */}
      <div className="card holidays-list-card" style={{ marginTop: "1.2rem" }}>
        <div className="section-heading">
          <h3>
            {isLoading
              ? "Holiday Calendar"
              : `Holiday Calendar (${holidays.length})`}
          </h3>
          <p>All holidays listed here apply institution-wide.</p>
        </div>

        {isLoading ? (
          <LoadingState type="list" />
        ) : holidays.length === 0 ? (
          <div className="empty-state">
            No holidays declared yet. Use the form above to add your first
            holiday.
          </div>
        ) : (
          <div className="holidays-grid">
            {holidays.map((item) => {
              const past = isPastDate(item.date);

              return (
                <article
                  key={item.id}
                  className={`holiday-card${
                    editingId === item.id ? " holiday-card-editing" : ""
                  }`}
                >
                  <div className="holiday-header">
                    <div className="holiday-header-content">
                      <h4 className="holiday-title">{item.name}</h4>
                      <div className="holiday-meta">
                        <span className="holiday-meta-item">
                          <span className="meta-icon" aria-hidden="true">
                            📅
                          </span>
                          <span>{formatDate(item.date)}</span>
                        </span>
                        <span
                          className={`badge ${
                            past
                              ? "holiday-badge-past"
                              : "holiday-badge-upcoming"
                          }`}
                        >
                          {past ? "Past" : "Upcoming"}
                        </span>
                      </div>
                    </div>

                    <div className="holiday-actions button-row">
                      <button
                        className="btn secondary btn-compact"
                        type="button"
                        onClick={() => handleEdit(item)}
                        aria-label={`Edit ${item.name}`}
                      >
                        Edit
                      </button>
                      <button
                        className="btn danger btn-compact"
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        aria-label={`Delete ${item.name}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {item.description && (
                    <p className="holiday-description">{item.description}</p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default HolidaySection;
