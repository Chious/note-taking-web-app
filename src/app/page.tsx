import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      All Notes Archived Notes Tags Search by title, content, or tags Color
      Theme Font Theme Change Password Logout
      {/* <!-- Color theme content start --> */}
      Color Theme Choose your color theme: Light Mode Pick a clean and classic
      light theme Dark Mode Select a sleek and modern dark theme System Adapts
      to your device theme Apply Changes
      {/* <!-- Color theme content end --> */}
      {/* <!-- Font theme content start --> */}
      Font Theme Choose your font theme: Sans-serif Clean and modern, easy to
      read. Serif Classic and elegant for a timeless feel. Monospace Code-like,
      great for a technical vibe. Apply Changes
      {/* <!-- Font theme content end --> */}
      {/* <!-- Change password content start --> */}
      Change Password Change Password Old Password New Password At least 8
      characters Confirm New Password Save Password
    </main>
  );
}
