export default function DepartmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="border-indigo-600">
      <div className="bg-indigo-50 dark:bg-indigo-950 px-4 py-2">
        <h2 className="text-sm font-bold text-indigo-900 dark:text-indigo-100">DEPARTMENT</h2>
      </div>
      {children}
    </div>
  );
}
