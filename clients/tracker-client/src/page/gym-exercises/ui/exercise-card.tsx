import placeholderSrc from '@/assets/exercise-placeholder.webp';
import { useMe } from '@/entity/auth';
import { ExerciseConfirmDelete, ExerciseEditTooltip } from '@/entity/exercises/ui';
import { useYoutubeUrlParse } from '@/shared/lib/react/use-youtube-url-parse';
import { AspectRatio } from '@/shared/ui-kit/ui/aspect-ratio';
import { Button } from '@/shared/ui-kit/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/ui-kit/ui/card';
import { cn } from '@/shared/ui-kit/utils';
import { Pencil, Trash2 } from 'lucide-react';

interface ExerciseCardProps {
  readonly name: string;
  readonly ownerId?: number;
  readonly loading: boolean;
  readonly exampleUrl?: string;
  readonly onMoreInfoClick?: () => void;
  readonly onDelete: () => void;
  readonly onEdit: () => void;
}

function ExerciseCard({
  name,
  ownerId,
  exampleUrl,
  loading,

  onMoreInfoClick,
  onEdit,
  onDelete,
}: ExerciseCardProps) {
  const { previewUrl } = useYoutubeUrlParse(exampleUrl);

  const { me } = useMe();
  const isMine = ownerId === me?.id;

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

      <CardFooter className="flex justify-between p-0 mt-auto">
        <Button size="sm" variant="outline" onClick={onMoreInfoClick}>
          Подробнее
        </Button>

        <div className="flex justify-end gap-2 mt-auto">
          <ExerciseEditTooltip on={!isMine}>
            <Button
              size="sm"
              disabled={loading}
              variant={isMine ? 'outline' : 'ghost'}
              className={cn({ 'opacity-50': !isMine })}
              onClick={() => void (isMine && onEdit())}
            >
              <Pencil />
            </Button>
          </ExerciseEditTooltip>

          <ExerciseConfirmDelete on={isMine} onOk={onDelete}>
            <Button
              size="sm"
              className={cn({ 'opacity-50': !isMine })}
              disabled={loading}
              variant={isMine ? 'destructive' : 'ghost'}
            >
              <Trash2 />
            </Button>
          </ExerciseConfirmDelete>
        </div>
      </CardFooter>
    </Card>
  );
}

export { ExerciseCard, type ExerciseCardProps };
