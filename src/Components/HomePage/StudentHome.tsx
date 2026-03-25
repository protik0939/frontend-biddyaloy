export default function StudentHome() {
  return (
    <div className="p-8 bg-gradient-to-br from-cyan-50 to-cyan-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-cyan-900 mb-2">Student Dashboard</h1>
        <p className="text-cyan-700 mb-8">Access your courses, grades, and academic information</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-cyan-600">
            <h2 className="text-xl font-semibold text-cyan-900 mb-2">Enrolled Courses</h2>
            <p className="text-gray-600">View your current course enrollments</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-cyan-600">
            <h2 className="text-xl font-semibold text-cyan-900 mb-2">My Grades</h2>
            <p className="text-gray-600">Check your grades and academic performance</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-cyan-600">
            <h2 className="text-xl font-semibold text-cyan-900 mb-2">Assignments</h2>
            <p className="text-gray-600">View and submit assignments</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-cyan-600">
            <h2 className="text-xl font-semibold text-cyan-900 mb-2">Schedule</h2>
            <p className="text-gray-600">View your class schedule</p>
          </div>
        </div>
      </div>
    </div>
  );
}
