import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { cookies } from "next/headers";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";
import RoleRenderer from "@/Components/RoleRenderer";
import AppToast from "@/Components/AppToast";

const siteBaseUrl =
  process.env.NEXT_PUBLIC_FRONTEND_URL?.trim() ||
  process.env.FRONTEND_PUBLIC_URL?.trim() ||
  "https://biddyaloy.vercel.app";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Biddyaloy",
  description: "Educational Management System",
  metadataBase: new URL(siteBaseUrl),
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/logo/BidyaloylogoIconOnly.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/favicon.ico" }],
  },
  openGraph: {
    title: "Biddyaloy",
    description: "Educational Management System",
    url: "/",
    siteName: "Biddyaloy",
    type: "website",
    images: [
      {
        url: "/biddyaloycover.webp",
        width: 1200,
        height: 630,
        alt: "Biddyaloy cover image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Biddyaloy",
    description: "Educational Management System",
    images: ["/biddyaloycover.webp"],
  },
};

const themeInitScript = `
(() => {
  try {
    const key = "theme";
    const stored = localStorage.getItem(key);
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored === "dark" || stored === "light" ? stored : (prefersDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch {
    document.documentElement.classList.remove("dark");
  }
})();
`;

type UserRole = 'SUPERADMIN' | 'ADMIN' | 'FACULTY' | 'DEPARTMENT' | 'TEACHER' | 'STUDENT' | 'UNAUTHENTICATED';

function normalizeRole(value: string | undefined): UserRole {
  if (!value) {
    return 'UNAUTHENTICATED';
  }

  const normalized = value.toUpperCase();
  const validRoles: UserRole[] = ['SUPERADMIN', 'ADMIN', 'FACULTY', 'DEPARTMENT', 'TEACHER', 'STUDENT', 'UNAUTHENTICATED'];

  return validRoles.includes(normalized as UserRole)
    ? (normalized as UserRole)
    : 'UNAUTHENTICATED';
}

export default async function RootLayout({
  children,
  superadmin,
  admin,
  faculty,
  department,
  teacher,
  student,
  unauthenticated,
}: Readonly<{
  children: React.ReactNode;
  superadmin: React.ReactNode;
  admin: React.ReactNode;
  faculty: React.ReactNode;
  department: React.ReactNode;
  teacher: React.ReactNode;
  student: React.ReactNode;
  unauthenticated: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialRole = normalizeRole(cookieStore.get('user_role')?.value);

  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased font-sans`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full">
        <AuthProvider initialRole={initialRole}>
          <AppToast />

          <RoleRenderer
            superadmin={superadmin}
            admin={admin}
            faculty={faculty}
            department={department}
            teacher={teacher}
            student={student}
            unauthenticated={unauthenticated}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
