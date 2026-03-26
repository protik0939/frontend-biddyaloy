export default function DepartmentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="border-indigo-600">{children}</div>;
}
