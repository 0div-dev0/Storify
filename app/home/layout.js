import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata = {
  title: "The Writer's Desk",
  description: "Your Storify dashboard — today's goals, your streak calendar, and AI lifestyle insights.",
};

export default function HomeLayout({ children }) {
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
