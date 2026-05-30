/* =============================================================================
 * utils.js — small framework-free helpers shared across the static template.
 * Exposes a global `Utils` object (no modules / build step required).
 * ========================================================================== */
(function (global) {
  'use strict';

  /**
   * Returns a debounced version of `fn` that waits `delay` ms after the last
   * call before running.
   */
  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var ctx = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(ctx, args);
      }, delay || 250);
    };
  }

  /**
   * Copy text to the clipboard with a fallback for non-secure contexts.
   * Returns a Promise<boolean>.
   */
  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard
        .writeText(text)
        .then(function () {
          return true;
        })
        .catch(function () {
          return fallbackCopy(text);
        });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  /** Human-readable byte size, e.g. 1536 -> "1.5 KB". */
  function formatBytes(bytes, decimals) {
    if (!isFinite(bytes) || bytes <= 0) return '0 B';
    var k = 1024;
    var dm = decimals == null ? 1 : decimals;
    var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /** Trigger a browser download for a Blob or data URL. */
  function downloadFile(data, filename) {
    var url = typeof data === 'string' ? data : URL.createObjectURL(data);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (typeof data !== 'string') {
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);
    }
  }

  /**
   * Briefly swap a button's label to a "copied!" state.
   */
  function flashCopied(btn, copiedLabel, originalLabel) {
    if (!btn) return;
    btn.textContent = copiedLabel;
    btn.classList.add('is-copied');
    setTimeout(function () {
      btn.textContent = originalLabel;
      btn.classList.remove('is-copied');
    }, 1500);
  }

  global.Utils = {
    debounce: debounce,
    copyToClipboard: copyToClipboard,
    formatBytes: formatBytes,
    downloadFile: downloadFile,
    flashCopied: flashCopied,
  };
})(window);


/* =============================================================================
 * Generic UI behaviors shared by every page (dropdown menus, mobile nav,
 * FAQ accordion). Driven entirely by data-attributes so the HTML stays clean.
 *   <button data-menu-toggle="#langMenu">      toggles the element #langMenu
 *   <button data-mobile-toggle="#mobileNav">   toggles the element #mobileNav
 *   <button class="faq-q">                     toggles its parent .faq-item
 * ========================================================================== */
(function () {
  'use strict';

  function closeAllMenus(except) {
    document.querySelectorAll('[data-menu]').forEach(function (menu) {
      if (menu !== except) menu.classList.add('hidden');
    });
  }

  function init() {
    document.addEventListener('click', function (e) {
      var toggle = e.target.closest('[data-menu-toggle]');
      if (toggle) {
        e.preventDefault();
        var sel = toggle.getAttribute('data-menu-toggle');
        var menu = document.querySelector(sel);
        if (menu) {
          var willOpen = menu.classList.contains('hidden');
          closeAllMenus(willOpen ? menu : null);
          menu.classList.toggle('hidden');
        }
        return;
      }

      var mobile = e.target.closest('[data-mobile-toggle]');
      if (mobile) {
        e.preventDefault();
        var target = document.querySelector(
          mobile.getAttribute('data-mobile-toggle')
        );
        if (target) target.classList.toggle('hidden');
        return;
      }

      var faq = e.target.closest('.faq-q');
      if (faq) {
        var item = faq.closest('.faq-item');
        if (item) item.classList.toggle('open');
        return;
      }

      // Clicking anywhere else closes any open dropdown menus.
      if (!e.target.closest('[data-menu]')) closeAllMenus(null);
    });

    // Close a language menu right after a language is picked.
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-set-lang]')) closeAllMenus(null);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
