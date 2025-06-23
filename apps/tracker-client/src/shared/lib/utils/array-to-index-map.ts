function arrayToIndexMap<T extends { id: number }>(array: T[]): Record<number, T> {
  return array.reduce<Record<number, T>>((acc, i) => {
    acc[i.id] = i;
    return acc;
  }, {});
}

export { arrayToIndexMap };
