import { useState } from 'react';
import { Trash2 } from 'lucide-react';

interface DaySchedule {
  id: string;
  selected: boolean;
  day: string;
  startTime: string;
  endTime: string;
  duration: string;
}

export function ClockTable() {
  const [setSameTime, setSetsameTime] = useState(false);
  const [schedules, setSchedules] = useState<DaySchedule[]>([
    { id: '1', selected: true, day: 'Monday', startTime: '07:15 AM', endTime: '08:15 AM', duration: '60 Min' },
    { id: '2', selected: true, day: 'Tuesday', startTime: '07:15 AM', endTime: '08:15 AM', duration: '60 Min' },
    { id: '3', selected: true, day: 'Wednesday', startTime: '07:15 AM', endTime: '08:15 AM', duration: '60 Min' },
    { id: '4', selected: true, day: 'Thursday', startTime: '07:15 AM', endTime: '08:15 AM', duration: '60 Min' },
    { id: '5', selected: true, day: 'Friday', startTime: '07:15 AM', endTime: '08:15 AM', duration: '60 Min' },
    { id: '6', selected: true, day: 'Saturday', startTime: '07:15 AM', endTime: '08:15 AM', duration: '60 Min' },
    { id: '7', selected: false, day: 'Sunday', startTime: '', endTime: '', duration: '' },
  ]);

  // Generate time options
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const displayMinute = minute.toString().padStart(2, '0');
        times.push(`${displayHour.toString().padStart(2, '0')}:${displayMinute} ${period}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const handleSelectDay = (id: string) => {
    setSchedules(schedules.map(schedule => 
      schedule.id === id ? { ...schedule, selected: !schedule.selected } : schedule
    ));
  };

  const handleDeleteDay = (id: string) => {
    setSchedules(schedules.map(schedule => 
      schedule.id === id ? { ...schedule, selected: false, startTime: '', endTime: '', duration: '' } : schedule
    ));
  };

  const handleStartTimeChange = (id: string, value: string) => {
    setSchedules(schedules.map(schedule => {
      if (schedule.id === id) {
        const duration = calculateDuration(value, schedule.endTime);
        return { ...schedule, startTime: value, duration };
      }
      return schedule;
    }));
  };

  const handleEndTimeChange = (id: string, value: string) => {
    setSchedules(schedules.map(schedule => {
      if (schedule.id === id) {
        const duration = calculateDuration(schedule.startTime, value);
        return { ...schedule, endTime: value, duration };
      }
      return schedule;
    }));
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return '';
    
    const parseTime = (time: string) => {
      const [timePart, period] = time.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const startMinutes = parseTime(start);
    const endMinutes = parseTime(end);
    const diffMinutes = endMinutes - startMinutes;

    if (diffMinutes <= 0) return '';
    
    return `${diffMinutes} Min`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">2023-24 ALLBATCH 1 MONTHS</h2>
        
        {/* Set same time checkbox */}
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={setSameTime}
              onChange={(e) => setSetsameTime(e.target.checked)}
              className="w-4 h-4 text-[#0F4C81] border-gray-300 rounded focus:ring-[#0F4C81]"
            />
            <span className="text-sm text-gray-700">Set same time for selected days</span>
          </label>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#0F4C81]">
                <th className="px-4 py-3 text-left text-white text-sm font-semibold border border-[#0F4C81]">Select</th>
                <th className="px-4 py-3 text-left text-white text-sm font-semibold border border-[#0F4C81]">Delete</th>
                <th className="px-4 py-3 text-left text-white text-sm font-semibold border border-[#0F4C81]">Days</th>
                <th className="px-4 py-3 text-left text-white text-sm font-semibold border border-[#0F4C81]">Start Time</th>
                <th className="px-4 py-3 text-left text-white text-sm font-semibold border border-[#0F4C81]">End Time</th>
                <th className="px-4 py-3 text-left text-white text-sm font-semibold border border-[#0F4C81]">Duration</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule, index) => (
                <tr 
                  key={schedule.id}
                  className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                >
                  {/* Select Checkbox */}
                  <td className="px-4 py-3 border border-gray-200">
                    <input
                      type="checkbox"
                      checked={schedule.selected}
                      onChange={() => handleSelectDay(schedule.id)}
                      className="w-4 h-4 text-[#0F4C81] border-gray-300 rounded focus:ring-[#0F4C81]"
                    />
                  </td>

                  {/* Delete Button */}
                  <td className="px-4 py-3 border border-gray-200">
                    <button
                      onClick={() => handleDeleteDay(schedule.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      disabled={!schedule.selected}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>

                  {/* Day Name */}
                  <td className="px-4 py-3 border border-gray-200">
                    <span className="text-sm text-gray-700 font-medium">{schedule.day}</span>
                  </td>

                  {/* Start Time Dropdown */}
                  <td className="px-4 py-3 border border-gray-200">
                    <select
                      value={schedule.startTime}
                      onChange={(e) => handleStartTimeChange(schedule.id, e.target.value)}
                      disabled={!schedule.selected}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <option value="">Select</option>
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </td>

                  {/* End Time Dropdown */}
                  <td className="px-4 py-3 border border-gray-200">
                    <select
                      value={schedule.endTime}
                      onChange={(e) => handleEndTimeChange(schedule.id, e.target.value)}
                      disabled={!schedule.selected}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <option value="">Select</option>
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </td>

                  {/* Duration */}
                  <td className="px-4 py-3 border border-gray-200">
                    <span className="text-sm text-gray-700">{schedule.duration}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Additional Fields */}
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sessions per Month
              </label>
              <input
                type="number"
                defaultValue="30"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Field
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
              />
            </div>
          </div>

          {/* Checkbox */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-[#0F4C81] border-gray-300 rounded focus:ring-[#0F4C81]"
              />
              <span className="text-sm text-gray-700">Auto update next month data</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}