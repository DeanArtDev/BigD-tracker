import placeholderSrc from '@/assets/exercise-placeholder.webp';
import { useYoutubeUrlParse } from '@/shared/lib/react/use-youtube-url-parse';
import { AspectRatio } from '@/shared/ui-kit/ui/aspect-ratio';
import { Button } from '@/shared/ui-kit/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui-kit/ui/card';
import { Plus } from 'lucide-react';

interface ExerciseCardProps {
  readonly name: string;
  readonly exampleUrl?: string;
  readonly onMoreInfoClick?: () => void;
  readonly onAddClick?: () => void;
}

function ExerciseCard({
  name,
  exampleUrl,
  onAddClick,
  onMoreInfoClick,
}: ExerciseCardProps) {
  const { previewUrl } = useYoutubeUrlParse(exampleUrl);

  return (
    <Card className="p-3 gap-3">
      <CardHeader className="p-1 gap-0">
        <CardTitle>{name}</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <AspectRatio ratio={16 / 9}>
          <img
            className="h-full w-full rounded-md object-cover"
            src={previewUrl ?? placeholderSrc}
            alt="Видео превью"
          />
        </AspectRatio>
      </CardContent>

      <CardFooter className="flex justify-between p-0">
        <Button size="sm" variant="outline" onClick={onMoreInfoClick}>
          Подробнее
        </Button>
        <Button size="sm" variant="outline" onClick={onAddClick}>
          <Plus />
        </Button>
      </CardFooter>
    </Card>
  );
}

export { ExerciseCard, type ExerciseCardProps };
