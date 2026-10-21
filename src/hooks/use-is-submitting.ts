import { useNavigation, useFormAction } from 'react-router';

const useIsSubmitting = () => {
  const navigation = useNavigation();
  const formAction = useFormAction();

  return navigation.state !== 'idle' && navigation.formAction === formAction;
};

export default useIsSubmitting;
