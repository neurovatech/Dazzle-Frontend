import React from 'react'

const NoData = ({ message = "There's nothing to show here right now. Please check back later." }) => (
  <div className="flex flex-col items-center justify-center text-center py-12 px-4 gap-4">
    <div className="w-22 h-22 rounded-full bg-gray-100 dark:bg-[#2c2c2a] flex items-center justify-center animate-bounce-slow">
      <i className="ti ti-file-off text-4xl text-gray-400" />
    </div>
    <div>
      {/* <p className="text-base font-medium mb-1">No data available</p> */}
      <p className="text-sm text-gray-500 dark:text-gray-300">{message}</p>
    </div>
  </div>
);
export default NoData
