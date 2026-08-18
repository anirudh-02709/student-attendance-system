import { useEffect, useState, useRef } from "react";
import {
  getAnnouncements,
  addAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../services/api";
import LoadingState from "./LoadingState";

const PAGE_SIZE = 5;

const emptyAnnouncement = {
  title: "",
  description: "",
  expiryDate: "",
};

function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState(emptyAnnouncement);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const formRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    getAnnouncements(0, PAGE_SIZE)
      .then((data) => {
        if (!isMounted) return;
        const items = Array.isArray(data)
          ? data
          : data?.content || data?.announcements || [];
        const pageNum =
          data?.number !== undefined
            ? data.number
            : data?.currentPage !== undefined
            ? data.currentPage
            : 0;
        const totalPagesNum =
          data?.totalPages !== undefined
            ? data.totalPages
            : items.length > 0
            ? 1
            : 0;
        const totalElementsNum =
          data?.totalElements !== undefined ? data.totalElements : items.length;

        setAnnouncements(items);
        setCurrentPage(pageNum);
        setTotalPages(totalPagesNum);
        setTotalElements(totalElementsNum);
        setIsLoading(false);
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error(error);
        setFeedback({
          type: "error",
          message: error.message || "Failed to load announcements.",
        });
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function loadAnnouncements(page = 0) {
    try {
      setIsLoading(true);
      const data = await getAnnouncements(page, PAGE_SIZE);

      const items = Array.isArray(data)
        ? data
        : data?.content || data?.announcements || [];
      const pageNum =
        data?.number !== undefined
          ? data.number
          : data?.currentPage !== undefined
          ? data.currentPage
          : page;
      const totalPagesNum =
        data?.totalPages !== undefined
          ? data.totalPages
          : items.length > 0
          ? 1
          : 0;
      const totalElementsNum =
        data?.totalElements !== undefined ? data.totalElements : items.length;

      setAnnouncements(items);
      setCurrentPage(pageNum);
      setTotalPages(totalPagesNum);
      setTotalElements(totalElementsNum);
    } catch (error) {
      console.error(error);
      setFeedback({
        type: "error",
        message: error.message || "Failed to load announcements.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handlePageChange = (page) => {
    if (page < 0 || (totalPages > 0 && page >= totalPages)) return;
    loadAnnouncements(page);
  };



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyAnnouncement);
    setIsEditMode(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      setFeedback({
        type: "error",
        message: "Title and description are required.",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      if (isEditMode && editingId) {
        await updateAnnouncement(editingId, formData);
        setFeedback({
          type: "success",
          message: "Announcement updated successfully.",
        });
        resetForm();
        await loadAnnouncements(currentPage);
      } else {
        await addAnnouncement(formData);
        setFeedback({
          type: "success",
          message: "Announcement published successfully.",
        });
        resetForm();
        await loadAnnouncements(0);
      }
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Failed to save announcement.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title || "",
      description: item.description || "",
      expiryDate: item.expiryDate || "",
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
    if (!window.confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    try {
      await deleteAnnouncement(id);
      setFeedback({
        type: "success",
        message: "Announcement deleted successfully.",
      });

      if (isEditMode && editingId === id) {
        resetForm();
      }

      const isLastItemOnPage = announcements.length === 1;
      const targetPage =
        isLastItemOnPage && currentPage > 0 ? currentPage - 1 : currentPage;

      await loadAnnouncements(targetPage);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Failed to delete announcement.",
      });
    }
  };

  function buildPageNumbers() {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(0);

    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages - 2, currentPage + 1);

    if (end - start < maxVisible - 3) {
      if (start === 1) {
        end = Math.min(totalPages - 2, start + maxVisible - 3);
      } else {
        start = Math.max(1, end - maxVisible + 3);
      }
    }

    if (start > 1) {
      pages.push("ellipsis-start");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 2) {
      pages.push("ellipsis-end");
    }

    pages.push(totalPages - 1);

    return pages;
  }

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date().toISOString().slice(0, 10);
    return expiryDate < today;
  };

  return (
    <section className="announcements-section" aria-labelledby="announcements-title">
      <div className="section-heading">
        <div>
          <h2 id="announcements-title">Faculty Announcements</h2>
          <p>Broadcast updates and notices to students in your batch.</p>
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
      <div className="card form-card announcements-form-card" ref={formRef}>
        <div className="section-heading">
          <h3>{isEditMode ? "Edit Announcement" : "Create New Announcement"}</h3>
          <p>
            {isEditMode
              ? "Modify the announcement details below."
              : "Share important announcements with your enrolled students."}
          </p>
        </div>

        <form className="form-grid" onSubmit={handleSubmit} autoComplete="off">
          <label>
            <span>
              Title <span aria-hidden="true" style={{ color: "var(--danger)" }}>*</span>
            </span>
            <input
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Midterm Examination Schedule"
              required
            />
          </label>

          <label>
            <span>Expiry Date (Optional)</span>
            <input
              name="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={handleInputChange}
            />
          </label>

          <label className="full-width">
            <span>
              Description <span aria-hidden="true" style={{ color: "var(--danger)" }}>*</span>
            </span>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Write the full announcement details here..."
              required
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
                    : "Publishing..."
                  : isEditMode
                  ? "Update Announcement"
                  : "Publish Announcement"}
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

      {/* Announcements List / Cards */}
      <div className="card announcements-list-card" style={{ marginTop: "1.2rem" }}>
        <div className="section-heading">
          <h3>
            {isLoading
              ? "Recent Announcements"
              : `Recent Announcements (${totalElements})`}
          </h3>
          <p>Review and manage all announcements issued for your batch.</p>
        </div>

        {isLoading ? (
          <LoadingState type="list" />
        ) : announcements.length === 0 ? (
          <div className="empty-state">
            No announcements created yet. Use the form above to post your first announcement.
          </div>
        ) : (
          <div className="announcements-grid">
            {announcements.map((item) => {
              const expired = isExpired(item.expiryDate);

              return (
                <article
                  key={item.id}
                  className={`announcement-card${
                    editingId === item.id ? " announcement-card-editing" : ""
                  }`}
                >
                  <div className="announcement-header">
                    <div className="announcement-header-content">
                      <h4 className="announcement-title">{item.title}</h4>
                      <div className="announcement-meta">
                        {item.createdAt && (
                          <span className="announcement-meta-item">
                            <span className="meta-icon" aria-hidden="true">📅</span>
                            <span>Posted on {item.createdAt}</span>
                          </span>
                        )}
                        {item.expiryDate && (
                          <span
                            className={`badge ${
                              expired
                                ? "announcement-badge-expired"
                                : "announcement-badge-active"
                            }`}
                          >
                            {expired
                              ? `Expired on ${item.expiryDate}`
                              : `Expires ${item.expiryDate}`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="announcement-actions button-row">
                      <button
                        className="btn secondary btn-compact"
                        type="button"
                        onClick={() => handleEdit(item)}
                        aria-label={`Edit ${item.title}`}
                      >
                        Edit
                      </button>
                      <button
                        className="btn danger btn-compact"
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        aria-label={`Delete ${item.title}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="announcement-description">{item.description}</p>
                </article>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="pagination" aria-label="Announcements pagination">
            <button
              className="btn secondary btn-compact pagination-btn"
              type="button"
              disabled={currentPage === 0}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              ← Previous
            </button>

            <div className="pagination-pages">
              {buildPageNumbers().map((item) => {
                if (typeof item === "string") {
                  return (
                    <span key={item} className="pagination-ellipsis">
                      …
                    </span>
                  );
                }

                return (
                  <button
                    key={item}
                    type="button"
                    className={`pagination-page${
                      item === currentPage ? " pagination-page-active" : ""
                    }`}
                    onClick={() => handlePageChange(item)}
                    aria-current={item === currentPage ? "page" : undefined}
                  >
                    {item + 1}
                  </button>
                );
              })}
            </div>

            <button
              className="btn secondary btn-compact pagination-btn"
              type="button"
              disabled={currentPage >= totalPages - 1}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next →
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}

export default AnnouncementsSection;
