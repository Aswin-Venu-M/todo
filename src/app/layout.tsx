import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todo | Multi-User Workspace",
  description:
    "A production-grade multi-user Kanban Todo application with secure session authentication and shared board access control.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en" className="h-full">
      <body className="orb-body orb-root orb-scrollbar min-h-full flex flex-col bg-[var(--orb-bg-app)] text-[var(--orb-text-primary)] antialiased">
        {children}
      </body>
    </html>
  );
}
