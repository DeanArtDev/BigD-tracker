import { DeleteTemplate } from '@/entity/planner/things/ui';
import type { ApiDto } from '@/shared/api/types';
import { Button } from '@/shared/ui-kit/ui/button';
import { LeftSwiper } from '@/shared/ui-kit/ui/left-swiper';
import { Trash } from 'lucide-react';
import { ThingCard } from './thing-card';

interface ThingCardMobileProps {
  readonly thing: ApiDto['ThingDto'];
  readonly onClick?: (thing: ApiDto['ThingDto']) => void;
  readonly onSuccess?: () => void;
}

function ThingCardMobile({ thing, onClick, onSuccess }: ThingCardMobileProps) {
  return (
    <LeftSwiper
      actionsSpace={40}
      actions={
        <div className="flex items-center h-full">
          <DeleteTemplate thingId={thing.id} onSuccess={onSuccess}>
            {({ isLoading }) => (
              <Button
                size="icon"
                disabled={isLoading}
                variant="ghost"
                onClick={(evt) => void evt.stopPropagation()}
              >
                <Trash />
              </Button>
            )}
          </DeleteTemplate>
        </div>
      }
    >
      <ThingCard thing={thing} onClick={onClick} />
    </LeftSwiper>
  );
}

export { ThingCardMobile, type ThingCardMobileProps };
