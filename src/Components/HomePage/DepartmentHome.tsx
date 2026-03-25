export default function DepartmentHome() {
  return (
    <div className="p-8 bg-gradient-to-br from-indigo-50 to-indigo-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-indigo-900 mb-2">Department Head Dashboard</h1>
        <p className="text-indigo-700 mb-8">Oversee department operations and resources</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-600">
            <h2 className="text-xl font-semibold text-indigo-900 mb-2">Department Staff</h2>
            <p className="text-gray-600">Manage department faculty and admin staff</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-600">
            <h2 className="text-xl font-semibold text-indigo-900 mb-2">Budget</h2>
            <p className="text-gray-600">Monitor department budget and expenses</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-600">
            <h2 className="text-xl font-semibold text-indigo-900 mb-2">Programs</h2>
            <p className="text-gray-600">Oversee academic programs and degrees</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-600">
            <h2 className="text-xl font-semibold text-indigo-900 mb-2">Reports</h2>
            <p className="text-gray-600">Generate department reports and metrics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
