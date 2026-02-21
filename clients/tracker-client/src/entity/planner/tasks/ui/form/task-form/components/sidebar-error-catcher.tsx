import { ButtonClose } from '@/shared/components/button-close';
import { useSidebar } from '@/shared/ui-kit/ui/sidebar';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useTaskFieldsRulesContext } from '../context';
import { validationStrategyByStatus } from '../validation-strategy';

function SidebarErrorCatcher() {
  const { status } = useTaskFieldsRulesContext();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const validationSchema = validationStrategyByStatus(status);
  type TaskFormData = z.input<typeof validationSchema>;

  const { isMobile, setOpen, setOpenMobile } = useSidebar();
  const { subscribe } = useFormContext<TaskFormData>();
  useEffect(() => {
    return subscribe({
      name: ['startDate', 'deadline'],
      formState: { errors: true },
      callback: (data) => {
        const deadlineError = data.errors?.['deadline'];
        const startDateError = data.errors?.['startDate'];
        if (deadlineError || startDateError) {
          isMobile ? setOpenMobile(true) : setOpen(true);
          toast.dismiss();
          const id = toast.error(deadlineError?.message ?? startDateError?.message, {
            position: isMobile ? 'bottom-center' : 'top-center',
            duration: 5000,

            action: (
              <ButtonClose className="size-3 ml-auto" onClick={() => void toast.dismiss(id)} />
            ),
          });
        }
      },
    });
  }, [subscribe, setOpen, setOpenMobile, isMobile]);

  return null;
}

export { SidebarErrorCatcher };
