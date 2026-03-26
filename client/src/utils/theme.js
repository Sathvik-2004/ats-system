const THEME_KEY = 'ats-theme';
const THEME_MODE_KEY = 'ats-theme-mode';

const isValidThemeMode = (mode) => mode === 'light' || mode === 'dark' || mode === 'auto';

const getSystemPreferredTheme = () => {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

export const resolveThemeMode = (mode) => {
  if (mode === 'dark') return 'dark';
  if (mode === 'auto') return getSystemPreferredTheme();
  return 'light';
};

export const getInitialThemeMode = () => {
  const storedMode = localStorage.getItem(THEME_MODE_KEY);
  if (isValidThemeMode(storedMode)) {
    return storedMode;
  }

  const legacyTheme = localStorage.getItem(THEME_KEY);
  if (legacyTheme === 'light' || legacyTheme === 'dark') {
    return legacyTheme;
  }

  return 'light';
};

export const applyThemeMode = (mode) => {
  const nextMode = isValidThemeMode(mode) ? mode : 'light';
  const resolvedTheme = resolveThemeMode(nextMode);

  document.documentElement.setAttribute('data-theme', resolvedTheme);
  localStorage.setItem(THEME_MODE_KEY, nextMode);
  localStorage.setItem(THEME_KEY, resolvedTheme);

  return { mode: nextMode, resolved: resolvedTheme };
};

export const toggleThemeMode = (currentMode, currentResolvedTheme) => {
  const resolvedTheme = currentResolvedTheme || resolveThemeMode(currentMode);
  const nextMode = resolvedTheme === 'dark' ? 'light' : 'dark';
  return applyThemeMode(nextMode);
};

export const subscribeToSystemThemeChanges = (onChange) => {
  if (!window.matchMedia) {
    return () => {};
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => onChange(resolveThemeMode('auto'));

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }

  mediaQuery.addListener(handler);
  return () => mediaQuery.removeListener(handler);
};