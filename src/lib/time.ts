export function UTFToLocalTime(time: string) {
  const date = new Date(time);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  if (isNaN(date.getTime())) return "";

  return `${day} ${month} ${year}`;
}
