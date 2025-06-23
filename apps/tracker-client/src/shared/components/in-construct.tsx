import placeholderSrc from '@/assets/in-construct.png';
import { AspectRatio } from '@/shared/ui-kit/ui/aspect-ratio';

function InConstruct() {
  return (
    <AspectRatio ratio={16 / 9}>
      <img className="h-full w-full object-contain" src={placeholderSrc} alt="Пока нет!" />
    </AspectRatio>
  );
}

export { InConstruct };
