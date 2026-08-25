import LoadingState from "./LoadingState";

function StudentHolidaySection({ holidays = [], isLoaded = false, loadError = false }) {
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
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const today = `${y}-${m}-${d}`;
    return dateStr < today;
  };

  return (
    <section
      className="card holidays-list-card"
      style={{ marginBottom: "1.2rem" }}
      aria-labelledby="student-holidays-heading"
    >
      <div className="section-heading">
        <div>
          <h2 id="student-holidays-heading">
            {!isLoaded
              ? "Holidays"
              : holidays.length > 0
              ? `Holidays (${holidays.length})`
              : "Holidays"}
          </h2>
          <p>Institution-wide holiday calendar for the academic year.</p>
        </div>
      </div>

      {!isLoaded ? (
        <LoadingState type="list" />
      ) : loadError && holidays.length === 0 ? (
        <div
          className="status-message status-error"
          role="alert"
          style={{ marginTop: 0 }}
        >
          <span>⚠</span>
          <span>Unable to load the holiday calendar. Please try again later.</span>
        </div>
      ) : holidays.length === 0 ? (
        <div className="empty-state">
          No holidays have been declared yet.
        </div>
      ) : (
        <div className="holidays-grid">
          {holidays.map((item) => {
            const past = isPastDate(item.date);

            return (
              <article key={item.id} className="holiday-card">
                <div className="holiday-header">
                  <div className="holiday-header-content">
                    <h3 className="holiday-title">{item.name}</h3>
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
                </div>

                {item.description && (
                  <p className="holiday-description">{item.description}</p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default StudentHolidaySection;
