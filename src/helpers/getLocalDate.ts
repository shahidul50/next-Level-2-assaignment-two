const getLocalDate = (date: string) => {
  const utcDate = new Date(date);

  const year = utcDate.getFullYear();
  const month = utcDate.getMonth() + 1;
  const day = utcDate.getDate();

  return `${year}-${month}-${day}`;
};

export default getLocalDate;
