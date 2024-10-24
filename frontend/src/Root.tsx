import { useState } from 'react'
import { Theme } from '@radix-ui/themes';
import { BrowserRouter } from 'react-router-dom'
import App from './App'

export default function Root() {
  const [appearance, setAppearance] = useState<'light' | 'dark'>(
    localStorage?.getItem("theme") as "light" | "dark" ?? 'light'
  );
  
  const toggleTheme = () => {
    const toggleTo = (appearance === 'light' ? 'dark' : 'light')
    setAppearance(toggleTo);
    localStorage?.setItem("theme", toggleTo);
  };

  return (
    <BrowserRouter>
      <Theme appearance={appearance}>
        <App toggleTheme={toggleTheme}/>
      </Theme>
    </BrowserRouter>
  );
}