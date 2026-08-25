import "../css/style.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnnouncementsSection from "../components/AnnouncementsSection";

function Announcements() {
  return (
    <>
      <Navbar />

      <main className="container">
        <section className="page-header">
          <div>
            <p className="eyebrow">Communication</p>
            <h1>Announcements</h1>
            <p className="page-subtitle">
              Create, manage, and broadcast important notices to students in your batch.
            </p>
          </div>
        </section>

        <AnnouncementsSection />
      </main>
      <Footer />
    </>
  );
}

export default Announcements;
