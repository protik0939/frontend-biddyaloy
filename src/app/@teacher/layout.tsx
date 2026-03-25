import LogoutButton from "@/Components/LogoutButton";

export default function TeacherLayout({
  children,
  pending,
  teacher,
}: Readonly<{
  children: React.ReactNode;
  pending: React.ReactNode;
  teacher: React.ReactNode;
}>) {



  return (
    <div className="border-green-600">
      <div className="bg-green-50 dark:bg-green-950 px-4 py-2">
        <h2 className="text-sm font-bold text-green-900 dark:text-green-100">TEACHER</h2>
      </div>
      <div className="grid gap-4">
        <LogoutButton />
        <div>{children}</div>
        <div>{pending}</div>
        <div>{teacher}</div>
      </div>
    </div>
  );
}
