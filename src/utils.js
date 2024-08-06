export const checkTime = (hourToCheck, minutesToCheck) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  return (
    currentHour > hourToCheck ||
    (currentHour === hourToCheck && currentMinutes >= minutesToCheck)
  );
};
