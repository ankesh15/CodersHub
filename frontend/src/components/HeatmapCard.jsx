import React from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import { toast } from "react-toastify";

const HeatmapCard = ({ title, platformUrl, loading, data, startDate, endDate }) => {
  const handleShowDate = (event, value) => {
    try {
      if (value && value.date) {
        const month = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December",
        ];
        const d = new Date(value.date);
        let name = month[d.getMonth()];
        let day = d.getDate();
        toast(`${value.count} Submissions on ${day} ${name}`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          theme: "light",
          toastId: "heatmap-toast", // prevent duplicate toast stacking
        });
      } else {
        toast.dismiss("heatmap-toast");
      }
    } catch (error) {
      toast.dismiss("heatmap-toast");
    }
  };

  const handleLeaveDate = () => {
    toast.dismiss("heatmap-toast");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {title} <span className="text-yellow-500 font-light">Heatmap</span>
        </h2>
        {platformUrl && (
          <a
            target="_blank"
            rel="noreferrer"
            href={platformUrl}
            className="text-gray-400 hover:text-yellow-500 transition-colors"
          >
            <i className="mdi mdi-link-variant text-xl"></i>
          </a>
        )}
      </div>

      <div className="flex-1 w-full overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
        {loading ? (
          <div className="w-full h-32 flex items-center justify-center">
            <div className="animate-pulse flex space-x-2 w-full max-w-lg">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        ) : data && data.length > 0 ? (
          <div className="min-w-[600px]">
            <CalendarHeatmap
              startDate={startDate}
              endDate={endDate}
              values={data}
              onMouseOver={(event, value) => handleShowDate(event, value)}
              onMouseLeave={handleLeaveDate}
              classForValue={(value) => {
                if (!value) {
                  return "fill-gray-100 dark:fill-gray-800";
                } else if (value.count == 1) {
                  return "fill-yellow-200 dark:fill-yellow-900/40";
                } else if (value.count == 2) {
                  return "fill-yellow-300 dark:fill-yellow-700/60";
                } else if (value.count == 3) {
                  return "fill-yellow-400 dark:fill-yellow-500/80";
                } else if (value.count >= 4) {
                  return "fill-yellow-500 dark:fill-yellow-400";
                }
              }}
              gutterSize={3}
            />
          </div>
        ) : (
          <div className="w-full h-32 flex items-center justify-center text-gray-400 text-sm">
            No data available for this period.
          </div>
        )}
      </div>
    </div>
  );
};

export default HeatmapCard;
