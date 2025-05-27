let resolved = false;
const minDelayOnce = (ms: number): Promise<null> =>
  new Promise((res) =>
    setTimeout(() => {
      resolved = true;
      res(null);
    }, ms),
  );

function MinDelayOnce({ ms }: { ms: number }) {
  if (!resolved) throw minDelayOnce(ms);
  return null;
}

export { MinDelayOnce };
