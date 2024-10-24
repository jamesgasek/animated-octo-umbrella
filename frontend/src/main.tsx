// main.tsx
import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { Theme } from '@radix-ui/themes';
import { BrowserRouter } from 'react-router-dom'

import "@radix-ui/themes/styles.css";

function Root() {
  const [appearance, setAppearance] = useState<'light' | 'dark'>(localStorage.getItem("theme") as "light" | "dark" ?? 'light');
  
  const toggleTheme = () => {
    const toggleTo = (appearance === 'light' ? 'dark' : 'light')
    setAppearance(toggleTo);
    localStorage.setItem("theme", toggleTo);
  };

  return (
    <BrowserRouter>
    <Theme appearance={appearance}>
      <App toggleTheme={toggleTheme}/>
    </Theme>
</BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)