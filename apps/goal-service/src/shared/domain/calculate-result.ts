export class CalculateResult {
  static execute(list: { isFinalized: boolean; result?: number }[]) {
    const totalParts = list.length;

    const partCost = 100 / totalParts;
    const sum = list.reduce((acc, group) => {
      const value = group.result ?? 0;
      if (value > 0) acc += partCost * (value / 100);
      return acc;
    }, 0);

    return Number(sum.toFixed(1));
  }
}
