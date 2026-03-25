import LogoutButton from "@/Components/LogoutButton";

export default function AdminLayout({
  children,
  pending,
  admin,
}: Readonly<{
  children: React.ReactNode;
  pending: React.ReactNode;
  admin: React.ReactNode;
}>) {
  return (
    <div className="border-blue-600">
      <div className="grid gap-4 p-4">
        <LogoutButton />
        <div>{children}</div>
        <div>{pending}</div>
        <div>{admin}</div>
      </div>
    </div>
  );
}
