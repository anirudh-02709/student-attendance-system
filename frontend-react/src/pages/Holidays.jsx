import "../css/style.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HolidaySection from "../components/HolidaySection";

function Holidays() {
  return (
    <>
      <Navbar />

      <main className="container">
        <section className="page-header">
          <div>
            <p className="eyebrow">Schedule</p>
            <h1>Holidays</h1>
            <p className="page-subtitle">
              Declare and manage institution-wide holidays on the shared calendar.
            </p>
          </div>
        </section>

        <HolidaySection />
      </main>
      <Footer />
    </>
  );
}

export default Holidays;
