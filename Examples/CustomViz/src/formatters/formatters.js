const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const monthsShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const isDateValid = (dateStr) => {
  return !isNaN(new Date(dateStr));
};

export const formatDate = (cell, format) => {
  if (isDateValid(cell.getValue())) {
    const d = new Date(cell.getValue());
    const fullYear = d.getFullYear().toString();
    const yearShort = fullYear.slice(-2);
    const fullMonth = months[d.getMonth()];
    const monthShort = monthsShort[d.getMonth()];
    const month = (d.getMonth() + 1).toString().padStart("2", 0);
    const fullDay = days[d.getDay()];
    const dayShort = daysShort[d.getDay()];
    const date = d.getDate().toString().padStart("2", 0);
    const hours = d.getHours().toString().padStart("2", 0);
    const hour = d.getHours().toString();
    const minutes = d.getMinutes().toString().padStart("2", 0);
    const seconds = d.getSeconds().toString().padStart("2", 0);
    const milliseconds = d.getMilliseconds().toString();
    const terrestrialTime = hours >= 12 ? "PM" : "AM";

    const formattedDate = format
      .replace("%ms", milliseconds)
      .replace("%ss", seconds)
      .replace("%mm", minutes)
      .replace("%HH", hours)
      .replace("%hh", hours)
      .replace("%H", hour)
      .replace("%h", hour)
      .replace("%dddd", fullDay)
      .replace("%ddd", dayShort)
      .replace("%dd", date)
      .replace("%MMMM", fullMonth)
      .replace("%MMM", monthShort)
      .replace("%MM", month)
      .replace("%yyyy", fullYear)
      .replace("%yy", yearShort)
      .replace("%tt", terrestrialTime);

    return formattedDate;
  }
};

export const getFormat = {
  datetime: function (cell) {
    if (isDateValid(cell.getValue())) {
      const d = new Date(cell.getValue());
      const dateString = d.toDateString() + ", " + d.toLocaleTimeString();
      return dateString;
    }
  },

  date: function (cell) {
    if (isDateValid(cell.getValue())) {
      const d = new Date(cell.getValue());
      const dateString = d.toLocaleDateString();
      return dateString;
    }
  },

  time: function (cell) {
    if (isDateValid(cell.getValue())) {
      const d = new Date(cell.getValue());
      const dateString = d.toLocaleTimeString();
      return dateString;
    }
  },
};
