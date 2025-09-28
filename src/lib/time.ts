export function UTFToLocalTime(time: string) {
  const date = new Date(time);

  if (isNaN(date.getTime())) return '';

  const day = date.getDate();
  const year = date.getFullYear();

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const month = monthNames[date.getMonth()];

  return `${day} ${month} ${year}`;
}
