import { useEffect } from 'react';

function TestRenderNode({ prefix = '' }: { prefix?: string }) {
  console.info(`${prefix} test component render`);
  useEffect(() => {
    console.info(`${prefix} test component mount`);
    return () => {
      console.info(`${prefix} test component unmount`);
    };
  }, [prefix]);
  return null;
}

export { TestRenderNode };
