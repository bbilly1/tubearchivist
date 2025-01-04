import { useUserConfigStore } from '../../stores/UserConfigStore';

export const ColourConstant = {
  Dark: 'dark.css',
  Light: 'light.css',
  Matrix: 'matrix.css',
  Midnight: 'midnight.css',
};

export type ColourVariants = 'dark.css' | 'light.css' | 'matrix.css' | 'midnight.css';

const importColours = () => {

  const { userConfig } = useUserConfigStore();
  const stylesheet = userConfig?.config.stylesheet

  switch (stylesheet) {
    case ColourConstant.Dark:
      return import('./components/Dark');

    case ColourConstant.Matrix:
      return import('./components/Matrix');

    case ColourConstant.Midnight:
      return import('./components/Midnight');

    case ColourConstant.Light:
      return import('./components/Light');

    default:
      return import('./components/Dark');
  }
};

export default importColours;
