/* Получить процент от from по value, возвращает процент от from */
function getPercentByValue(value: number, from: number): number {
  return (value / from) * 100;
}

/* Получить процент от процента, возвращает процент */
function getPercentFromPercent(percent: number, from: number): number {
  return (from / 100) * percent;
}

export { getPercentByValue, getPercentFromPercent };
