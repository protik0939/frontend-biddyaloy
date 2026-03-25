export default function TeacherHome() {
  return (
    <div className="p-8 bg-gradient-to-br from-green-50 to-green-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-green-900 mb-2">Teacher Dashboard</h1>
        <p className="text-green-700 mb-8">Manage courses, classes, and student learning</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-600">
            <h2 className="text-xl font-semibold text-green-900 mb-2">My Classes</h2>
            <p className="text-gray-600">View and manage assigned classes</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-600">
            <h2 className="text-xl font-semibold text-green-900 mb-2">Attendance</h2>
            <p className="text-gray-600">Track student attendance and participation</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-600">
            <h2 className="text-xl font-semibold text-green-900 mb-2">Assignments</h2>
            <p className="text-gray-600">Create and manage student assignments</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-600">
            <h2 className="text-xl font-semibold text-green-900 mb-2">Grades</h2>
            <p className="text-gray-600">Record and manage student grades</p>
          </div>
        </div>
      </div>
    </div>
  );
}
