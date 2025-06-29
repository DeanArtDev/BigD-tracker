import { useCommonNotifications } from '@/shared/ui-kit/helpers';

const getDefaultQueryNotifications = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { somethingWentWrong, success } = useCommonNotifications();
  return {
    onSuccess: success,
    onError: somethingWentWrong,
  };
};

export { getDefaultQueryNotifications };
