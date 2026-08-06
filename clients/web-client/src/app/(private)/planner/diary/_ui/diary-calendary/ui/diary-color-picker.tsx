import { DefaultColorPicker } from '@dayflow/core';
import { h, render } from 'preact';
import { useEffect, useLayoutEffect, useRef } from 'react';

interface DiaryColorPickerProps {
  readonly color: string;
  readonly onChange: (color: { readonly hex: string }, isPending?: boolean) => void;
  readonly onClose: () => void;
}

function DiaryColorPicker({ color, onChange, onClose }: DiaryColorPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current == null) return;

    render(h(DefaultColorPicker, { color, onChange, onClose }), containerRef.current);
  }, [color, onChange, onClose]);

  useEffect(() => {
    const container = containerRef.current;

    return () => {
      if (container != null) render(null, container);
    };
  }, []);

  return <div ref={containerRef} />;
}

export { DiaryColorPicker };
