import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body {
    margin: 0;
    font-family: 'Poppins', sans-serif;
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.6;
  }
  h1, h2, h3, h4, h5, h6 {
    margin-top: 0;
    font-weight: 600;
  }
  h1 { font-size: ${({ theme }) => theme.typography.h1}; }
  h2 { font-size: ${({ theme }) => theme.typography.h2}; }
  h3 { font-size: ${({ theme }) => theme.typography.h3}; }

  a { 
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: color 0.2s ease-in-out;
  }
  a:hover, a:focus { 
    color: ${({ theme }) => theme.colors.primaryDark};
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  img { display: block; max-width: 100%; }
`