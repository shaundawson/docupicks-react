import { createTheme } from '@mui/material/styles';

// IMDB Gold color
const imdbGold = '#f5c518';

const imdbDarkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: imdbGold,
            contrastText: '#181818',
        },
        secondary: {
            main: '#01b4e4',
        },
        background: {
            default: '#181818',
            paper: '#232323',
        },
        text: {
            primary: '#fff',
            secondary: '#b3b3b3',
        },
        divider: '#333',
    },
    typography: {
        fontFamily: [
            'Amazon Ember',
            'Helvetica Neue',
            'Arial',
            'sans-serif',
        ].join(','),
        h6: {
            fontWeight: 700,
            fontSize: '1.1rem',
        },
        body2: {
            lineHeight: 1.4,
        },
        button: {
            fontWeight: 700,
        }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '20px',
                    padding: '8px 20px',
                    textTransform: 'none',
                    fontWeight: 700,
                },
                containedPrimary: {
                    backgroundColor: imdbGold,
                    color: '#181818', // Black text on gold
                    '&:hover': {
                        backgroundColor: '#ffe066',
                        color: '#181818',
                    },
                },
                outlinedPrimary: {
                    borderColor: imdbGold,
                    color: imdbGold, // Gold text on transparent
                    backgroundColor: 'transparent',
                    '&:hover': {
                        backgroundColor: 'rgba(245,197,24,0.10)',
                        color: imdbGold,
                    },
                },
                textPrimary: {
                    color: imdbGold, // Gold text for text buttons
                    '&:hover': {
                        backgroundColor: 'rgba(245,197,24,0.08)',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 700,
                    backgroundColor: imdbGold,
                    color: '#181818', // Black text on gold
                    '&.MuiChip-outlined': {
                        borderColor: imdbGold,
                        color: imdbGold,
                        backgroundColor: 'transparent',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    boxShadow: '0 2px 12px rgba(245, 197, 24, 0.10)',
                    backgroundColor: '#232323',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    '&:hover': {
                        boxShadow: '0 4px 20px rgba(245, 197, 24, 0.20)',
                        transform: 'translateY(-4px) scale(1.02)',
                        border: `1.5px solid ${imdbGold}`,
                    },
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: `${imdbGold} #181818`,
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        backgroundColor: "#181818",
                        width: 8,
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        backgroundColor: imdbGold,
                        borderRadius: 4,
                    },
                },
            },
        },
    },
});

const imdbLightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: imdbGold,
            contrastText: '#181818',
        },
        secondary: {
            main: '#01b4e4',
        },
        background: {
            default: '#fff',
            paper: '#fafafa',
        },
        text: {
            primary: '#181818',
            secondary: '#404040',
        },
        divider: '#e0e0e0',
    },
    typography: { ...imdbDarkTheme.typography },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '20px',
                    padding: '8px 20px',
                    textTransform: 'none',
                    fontWeight: 700,
                },
                containedPrimary: {
                    backgroundColor: imdbGold,
                    color: '#181818', // Black text on gold
                    '&:hover': {
                        backgroundColor: '#ffe066',
                        color: '#181818',
                    },
                },
                outlinedPrimary: {
                    borderColor: imdbGold,
                    color: '#181818', // Black text for outlined buttons
                    backgroundColor: 'transparent',
                    '&:hover': {
                        backgroundColor: 'rgba(245,197,24,0.08)',
                    },
                },
                textPrimary: {
                    color: '#181818', // Black text for text buttons
                    '&:hover': {
                        backgroundColor: 'rgba(245,197,24,0.08)',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 700,
                    backgroundColor: imdbGold,
                    color: '#181818', // Black text on gold
                    '&.MuiChip-outlined': {
                        borderColor: imdbGold,
                        color: '#181818',
                        backgroundColor: 'transparent',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    boxShadow: '0 2px 12px rgba(245, 197, 24, 0.06)',
                    backgroundColor: '#fafafa',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    '&:hover': {
                        boxShadow: '0 4px 20px rgba(245, 197, 24, 0.13)',
                        transform: 'translateY(-4px) scale(1.02)',
                        border: `1.5px solid ${imdbGold}`,
                    },
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: "#01b4e4 #fafafa",
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        backgroundColor: "#fafafa",
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        backgroundColor: "#01b4e4",
                        borderRadius: 4,
                    },
                },
            },
        },
    },
});

export { imdbDarkTheme, imdbLightTheme };
