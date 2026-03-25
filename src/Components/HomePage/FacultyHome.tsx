export default function FacultyHome() {
  return (
    <div className="p-8 bg-gradient-to-br from-purple-50 to-purple-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-900 mb-2">Faculty Dashboard</h1>
        <p className="text-purple-700 mb-8">Manage courses, curriculum, and faculty operations</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600">
            <h2 className="text-xl font-semibold text-purple-900 mb-2">Courses</h2>
            <p className="text-gray-600">View and manage courses offered by the faculty</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600">
            <h2 className="text-xl font-semibold text-purple-900 mb-2">Curriculum</h2>
            <p className="text-gray-600">Design and update curriculum for programs</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600">
            <h2 className="text-xl font-semibold text-purple-900 mb-2">Teachers</h2>
            <p className="text-gray-600">Manage faculty members and their schedules</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600">
            <h2 className="text-xl font-semibold text-purple-900 mb-2">Analytics</h2>
            <p className="text-gray-600">View faculty performance and statistics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
