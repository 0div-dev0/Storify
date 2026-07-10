import Navbar from "@/components/Navbar";

export default function HomeLayout({ children }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden pb-16 md:pb-0">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        {children}
      </div>
    </div>
  );
}