/* =============================================================================
 * theme.js — dark mode toggle persisted to localStorage.
 *
 * The actual class is applied as early as possible by an inline script in each
 * page's <head> (to avoid a flash of the wrong theme). This file wires up the
 * toggle buttons and keeps the <html> class + stored preference in sync.
 * ========================================================================== */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'msb-theme'; // 'light' | 'dark'
  var root = document.documentElement;

  function getStored() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function systemPrefersDark() {
    return (
      global.matchMedia &&
      global.matchMedia('(prefers-color-scheme: dark)').matches
    );
  }

  function currentTheme() {
    return root.classList.contains('dark') ? 'dark' : 'light';
  }

  function apply(theme) {
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* ignore */
    }
    updateToggleIcons(theme);
  }

  function toggle() {
    apply(currentTheme() === 'dark' ? 'light' : 'dark');
  }

  function updateToggleIcons(theme) {
    var sun = document.querySelectorAll('[data-theme-icon="sun"]');
    var moon = document.querySelectorAll('[data-theme-icon="moon"]');
    sun.forEach(function (el) {
      el.classList.toggle('hidden', theme === 'dark');
    });
    moon.forEach(function (el) {
      el.classList.toggle('hidden', theme !== 'dark');
    });
  }

  function init() {
    // Resolve the initial theme (stored > system) and apply it.
    var stored = getStored();
    var initial = stored || (systemPrefersDark() ? 'dark' : 'light');
    apply(initial);

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', toggle);
    });

    // React to OS changes only when the user hasn't chosen explicitly.
    if (global.matchMedia) {
      global
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', function (e) {
          if (!getStored()) apply(e.matches ? 'dark' : 'light');
        });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.Theme = { toggle: toggle, apply: apply, current: currentTheme };
})(window);
