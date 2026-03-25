export default function FacultyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="border-purple-600">
      <div className="bg-purple-50 dark:bg-purple-950 px-4 py-2">
        <h2 className="text-sm font-bold text-purple-900 dark:text-purple-100">FACULTY</h2>
      </div>
      {children}
    </div>
  );
}
