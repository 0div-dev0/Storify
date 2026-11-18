import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { DataProvider } from "@/lib/DataContext";

export const metadata = {
  title: {
    default: "Storify | Fun and productive journalling",
    template: "%s | Storify",
  },
  description:
    "Create a productive journalling environment with Storify, where each journal helps track your habits and frame your life in a story — because your life is YOUR story.",
  verification: {
    google: "AE3-o2pDINIIQszbPW_Mt9Enps020dlSrb_jn8JNYI4",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <DataProvider>
            <main>{children}</main>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
