function formatDateNow() {
  const date = new Date();
  console.log(date);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

module.exports = formatDateNow;
