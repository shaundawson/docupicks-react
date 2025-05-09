import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles';
import './index.css'
import App from './App.tsx'
import { imdbDarkTheme, imdbLightTheme } from './theme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={[imdbDarkTheme, imdbLightTheme]}>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
