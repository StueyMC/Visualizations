export const getEditor = (formatter) => {
  if (!formatter) {
    return;
  }
  if (formatter.includes("%")) {
    return "date";
  } else {
    switch (formatter) {
      case "datetime":
        return "date";

      case "date":
        return "date";

      case "time":
        return "date";

      default:
        return true;
    }
  }
};
