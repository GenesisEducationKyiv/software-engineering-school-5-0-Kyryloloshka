export const mapToDay = (isDay: number): 'day' | 'night' => {
  if (isDay === undefined || isDay === null) {
    return 'day'; // Default to 'day' if isDay is undefined or null
  }
  return isDay === 1 ? 'day' : 'night';
};
