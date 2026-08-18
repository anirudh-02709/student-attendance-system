import { useEffect, useState } from "react";
import { getStudentAnnouncements } from "../services/api";
import LoadingState from "./LoadingState";

const PAGE_SIZE = 5;

function StudentAnnouncementsSection() {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    let isMounted = true;

    getStudentAnnouncements(0, PAGE_SIZE)
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
        setErrorMessage(error.message || "Failed to load announcements.");
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function loadAnnouncements(page = 0) {
    try {
      setIsLoading(true);
      const data = await getStudentAnnouncements(page, PAGE_SIZE);

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
      setErrorMessage("");
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Failed to load announcements.");
    } finally {
      setIsLoading(false);
    }
  }

  const handlePageChange = (page) => {
    if (page < 0 || (totalPages > 0 && page >= totalPages)) return;
    loadAnnouncements(page);
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

  return (
    <section
      className="card announcements-list-card"
      style={{ marginBottom: "1.2rem" }}
      aria-labelledby="student-announcements-heading"
    >
      <div className="section-heading">
        <div>
          <h2 id="student-announcements-heading">
            {isLoading
              ? "Faculty Announcements"
              : totalElements > 0
              ? `Faculty Announcements (${totalElements})`
              : "Faculty Announcements"}
          </h2>
          <p>Important notices and announcements from your faculty.</p>
        </div>
      </div>

      {errorMessage && (
        <div
          className="status-message status-error"
          role="alert"
          style={{ marginBottom: "1rem", marginTop: 0 }}
        >
          <span>⚠</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {isLoading ? (
        <LoadingState type="list" />
      ) : announcements.length === 0 ? (
        <div className="empty-state">
          No announcements from your faculty at this time.
        </div>
      ) : (
        <div className="announcements-grid">
          {announcements.map((item) => (
            <article key={item.id} className="announcement-card">
              <div className="announcement-header">
                <div className="announcement-header-content">
                  <h3 className="announcement-title">{item.title}</h3>
                  <div className="announcement-meta">
                    {item.createdAt && (
                      <span className="announcement-meta-item">
                        <span className="meta-icon" aria-hidden="true">📅</span>
                        <span>Posted on {item.createdAt}</span>
                      </span>
                    )}
                    {item.expiryDate && (
                      <span className="badge announcement-badge-active">
                        Expires {item.expiryDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="announcement-description">{item.description}</p>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="pagination" aria-label="Student announcements pagination">
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
    </section>
  );
}

export default StudentAnnouncementsSection;
