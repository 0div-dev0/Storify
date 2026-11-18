import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata = {
  title: "Journal",
  description: "Your personal journaling companion",
};

export default function JournalLayout({ children }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden pb-16 md:pb-0">
      <Navbar />
      <ProtectedRoute>
        <div className="flex-1 flex overflow-hidden">
          {children}
        </div>
      </ProtectedRoute>
    </div>
  );
}
