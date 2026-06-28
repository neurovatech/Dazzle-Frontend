
export function ThemeScript() {
    const script = `
    (function() {
      try {
        var t = localStorage.getItem('theme') || 'system';
        var isDark = t === 'dark' || 
          (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) document.documentElement.classList.add('dark');
      } catch(e) {}
    })();
  `;
    return <script dangerouslySetInnerHTML={{ __html: script }} />;
}