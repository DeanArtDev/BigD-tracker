import { LoaderCircle } from 'lucide-react';

function AppLoader({ inverse, size = 70 }: { size?: number; inverse?: boolean }) {
  return (
    <LoaderCircle
      color={inverse ? undefined : '#8e51ff'}
      className="animate-spin m-auto"
      size={size}
    />
  );
}

export { AppLoader };
