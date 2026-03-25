export default function StudentLayout({
  children,
  pending,
  student,
}: Readonly<{
  children: React.ReactNode;
  pending: React.ReactNode;
  student: React.ReactNode;
}>) {
  return (
    <div className="border-cyan-600">
      <div className="bg-cyan-50 dark:bg-cyan-950 px-4 py-2">
        <h2 className="text-sm font-bold text-cyan-900 dark:text-cyan-100">STUDENT</h2>
      </div>
      <div className="grid gap-4 p-4">
        <div>{children}</div>
        <div>{pending}</div>
        <div>{student}</div>
      </div>
    </div>
  );
}
