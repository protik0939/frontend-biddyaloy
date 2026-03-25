export default function AdminHome() {
  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">Admin Dashboard</h1>
        <p className="text-blue-700 mb-8">Manage departments, faculty, and educational resources</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">Departments</h2>
            <p className="text-gray-600">Manage all departments and their operations</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">Faculty Management</h2>
            <p className="text-gray-600">Oversee faculty members and their assignments</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">Academic Calendar</h2>
            <p className="text-gray-600">Manage academic schedules and events</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">Reports</h2>
            <p className="text-gray-600">Generate institutional reports and statistics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
