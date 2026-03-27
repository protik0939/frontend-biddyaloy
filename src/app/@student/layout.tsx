export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="border-cyan-600">{children}</div>;
}
