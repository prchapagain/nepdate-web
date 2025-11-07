import { useState, useEffect } from 'react';
import { MenuStyle, DesktopLayoutStyle } from '../types/types';

export const useLayout = () => {
  const [menuStyle, setMenuStyle] = useState<MenuStyle>('tabs');
  const [desktopLayoutStyle, setDesktopLayoutStyle] = useState<DesktopLayoutStyle>('topbar');

  useEffect(() => {
    const savedMenuStyle = localStorage.getItem('menuStyle') as MenuStyle | null;
    setMenuStyle(savedMenuStyle || 'tabs');
    const savedDesktopLayout = localStorage.getItem('desktopLayoutStyle') as DesktopLayoutStyle | null;
    setDesktopLayoutStyle(savedDesktopLayout || 'topbar');
  }, []);

  const handleSetMenuStyle = (style: MenuStyle) => {
    setMenuStyle(style);
    localStorage.setItem('menuStyle', style);
  };

  const handleSetDesktopLayoutStyle = (style: DesktopLayoutStyle) => {
    setDesktopLayoutStyle(style);
    localStorage.setItem('desktopLayoutStyle', style);
  };

  const resetLayoutSettings = () => {
    localStorage.removeItem('menuStyle');
    localStorage.removeItem('desktopLayoutStyle');
    setMenuStyle('tabs');
    setDesktopLayoutStyle('topbar');
  };

  return {
    menuStyle,
    desktopLayoutStyle,
    handleSetMenuStyle,
    handleSetDesktopLayoutStyle,
    resetLayoutSettings,
  };
};