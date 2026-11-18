import Navbar from "@/components/Navbar";
import Hero from "@/components/landing/Hero";
import Ticker from "@/components/landing/Ticker";
import What from "@/components/landing/What";
import Why from "@/components/landing/Why";
import How from "@/components/landing/How";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";
import SectionChoreography from "@/components/landing/SectionChoreography";

// The landing page keeps the brand line as-is; every other route inherits the
// "%s | Storify" template from the root layout.
export const metadata = {
  title: { absolute: "Storify | Fun and productive journalling" },
};

const TICKER_WORDS = [
  "reflect",
  "notice",
  "write it down",
  "set a goal",
  "let it read you",
  "change the pattern",
  "your life, in chapters",
];

export default function LandingPage() {
  return (
    <div id="top" className="flex flex-col min-h-screen bg-paper">
      <Navbar />

      {/* Each wrapper is a scroll "chapter". SectionChoreography animates the
          [data-chapter-visual] element inside each one, never the wrapper's
          layout box, so pins and anchors keep their measurements. */}
      <div data-chapter="Hero">
        <Hero />
      </div>
      <div data-chapter="Reflect">
        <Ticker
          items={TICKER_WORDS}
          className="bg-mahogany text-parchment border-y border-espresso/40"
        />
      </div>
      <div data-chapter="What">
        <What />
      </div>
      <div data-chapter="Why">
        <Why />
      </div>
      <div data-chapter="How">
        <How />
      </div>
      <div data-chapter="Chapters">
        <Ticker
          items={[...TICKER_WORDS].reverse()}
          reverse
          className="bg-cocoa text-parchment border-y border-espresso/40"
        />
      </div>
      <div data-chapter="Hello">
        <Contact />
      </div>
      <div data-chapter="Finis">
        <Footer />
      </div>

      {/* Rendered last so its ScrollTriggers are created after the pinned
          horizontal section's triggers. */}
      <SectionChoreography />
    </div>
  );
}
