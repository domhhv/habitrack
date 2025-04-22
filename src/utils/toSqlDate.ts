const toSqlDate = (date: Date) => {
  const month =
    date.getMonth() < 10 ? `0${date.getMonth() + 1}` : date.getMonth();

  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();

  return `${date.getFullYear()}-${month}-${day}`;
};

export default toSqlDate;
