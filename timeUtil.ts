export const getFormattedTimeFromSeconds = (sec: number) => {
  const date = new Date(0);
  date.setSeconds(sec);
  return date.toISOString().substring(14, 19);
};
