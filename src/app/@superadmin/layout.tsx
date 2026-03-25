export default function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="border-red-600">
      {children}
    </div>
  );
}
