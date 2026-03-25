import NavBar from "./Components/Navbar/NavBar";

export default function UnauthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="border-gray-600">
      <NavBar />
      {children}
    </div>
  );
}
