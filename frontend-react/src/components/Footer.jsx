function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <p>© {year} Attendance System. Designed for efficient student management.</p>
    </footer>
  );
}

export default Footer;
