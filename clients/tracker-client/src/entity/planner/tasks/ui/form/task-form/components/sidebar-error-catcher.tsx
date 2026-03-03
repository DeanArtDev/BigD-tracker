import { useSidebar } from '@/shared/ui-kit/ui/sidebar';
import { isEmpty } from 'lodash-es';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useValidationSchema } from '../lib/use-validation-schema';

function SidebarErrorCatcher() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const validationSchema = useValidationSchema();
  type TaskFormData = z.input<typeof validationSchema>;

  const { isMobile, setOpen, setOpenMobile } = useSidebar();
  const { subscribe } = useFormContext<TaskFormData>();

  useEffect(() => {
    return subscribe({
      name: ['recurrence', 'startDate', 'deadline'],
      formState: { errors: true },
      callback: (data) => {
        const errorList = data.errors?.['recurrence'];

        const err = [
          data.errors?.['startDate']?.message,
          data.errors?.['deadline']?.message,
          errorList?.start?.message,
          errorList?.end?.message,
          errorList?.frequency?.message,
          errorList?.weekdays?.message,
        ]
          .filter(Boolean)
          .at(0);

        if (!isEmpty(err)) {
          isMobile ? setOpenMobile(true) : setOpen(true);
          toast.error(err, {
            position: isMobile ? 'bottom-center' : 'top-center',
            duration: 5000,
            closeButton: true,
          });
        }
      },
    });
  }, [subscribe, setOpen, setOpenMobile, isMobile]);

  return null;
}

export { SidebarErrorCatcher };
