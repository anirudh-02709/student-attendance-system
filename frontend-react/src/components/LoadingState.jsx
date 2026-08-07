function LoadingState({ type = "cards" }) {
  if (type === "stats") {
    return (
      <div className="skeleton-grid" role="status" aria-live="polite">
        {[...Array(3)].map((_, index) => (
          <div className="card skeleton-card" key={index}>
            <div className="skeleton skeleton-line skeleton-short" />
            <div className="skeleton skeleton-line skeleton-medium" />
            <div className="skeleton skeleton-line skeleton-wide" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "form") {
    return (
      <div className="card skeleton-card" role="status" aria-live="polite">
        <div className="skeleton skeleton-line skeleton-short" />
        <div className="skeleton-grid skeleton-inline">
          <div className="skeleton skeleton-line skeleton-medium" />
          <div className="skeleton skeleton-line skeleton-medium" />
          <div className="skeleton skeleton-line skeleton-medium" />
          <div className="skeleton skeleton-line skeleton-medium" />
        </div>
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="card skeleton-card" role="status" aria-live="polite">
        <div className="skeleton skeleton-line skeleton-short" />
        <div className="skeleton skeleton-line skeleton-wide" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line" />
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className="skeleton-list" role="status" aria-live="polite">
        {[...Array(4)].map((_, index) => (
          <div className="skeleton-item" key={index}>
            <div className="skeleton skeleton-line skeleton-medium" />
            <div className="skeleton skeleton-line skeleton-short" />
          </div>
        ))}
      </div>
    );
  }

  return <div className="loading-state">Loading...</div>;
}

export default LoadingState;
