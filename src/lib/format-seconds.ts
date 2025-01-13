export function formatSeconds(seconds: number) {
  if (seconds < 60) {
    return `${Math.round(seconds).toString()}s`;
  }

  const minutes = seconds / 60;
  if (minutes < 60) {
    return `${Math.round(minutes).toString()}m`;
  }

  const hours = minutes / 60;
  if (hours < 24) {
    return `${Math.round(hours).toString()}h`;
  }

  const days = hours / 24;
  return `${Math.round(days).toString()}d`;
}
