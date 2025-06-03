


export default function Calling() {
  return (
    <div className="min-h-screen bg-[#fff] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-md p-6">
        {/* Call Box */}
        <div className="bg-gray-50 rounded-xl p-4 mb-8 relative">
          <div className="flex justify-between items-start mb-2">
            <div className="text-lg font-semibold">Dialer</div>
            <div className="text-sm text-gray-500">(00:10)</div>
          </div>
          <div className="text-center text-lg font-medium mb-2">876-9885-8677</div>

          {/* Call Controls */}
          <div className="flex justify-center items-center space-x-6 my-4">
            <button className="text-2xl text-black">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25m0 0l3 3m-3-3l-3 3M9 15v3.75m0 0l-3-3m3 3l3-3" />
              </svg>
            </button>
            <button className="bg-red-100 text-red-600 px-6 py-2 rounded-full font-semibold text-sm hover:bg-red-200">
              End Call
            </button>
            <button className="text-black">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9v6m6-6v6" />
              </svg>
            </button>
          </div>

          {/* Recording Badge */}
          <div className="absolute top-4 right-4 bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full">
            Recording
          </div>
        </div>

        {/* Post Call Entry */}
        <div className="text-center">
          <div className="font-medium text-gray-800 mb-1">Post-Call Case Entry</div>
          <p className="text-sm text-gray-500 mb-4">
            Click here to open the form and enter case information from your recent call.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-full">
            Post Call
          </button>
        </div>
      </div>
    </div>
  );
}
