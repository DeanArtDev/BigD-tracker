import { LoaderCircle } from 'lucide-react';

function AppLoader({ size = 70 }: { size?: number }) {
  return <LoaderCircle color="#8e51ff" className="animate-spin m-auto" size={size} />;
}

export { AppLoader };
