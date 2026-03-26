export default function FacultyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="border-purple-600">{children}</div>;
}
