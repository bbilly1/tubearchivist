import { useUserConfigStore } from '../stores/UserConfigStore';

const loadIsAdmin = () => {
  const { userConfig } = useUserConfigStore()
  const isAdmin = userConfig?.is_staff || userConfig?.is_superuser;

  return isAdmin;
};

export default loadIsAdmin;
