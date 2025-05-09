import { createTheme } from '@mui/material/styles';

const imdbProTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#f5c518', // yellow
            contrastText: '#000',
        },
        secondary: {
            main: '#01b4e4', // blue accent
        },
        background: {
            default: '#121212',
            paper: '#1a1a1a',
        },
        text: {
            primary: '#ffffff',
            secondary: '#a3a3a3',
        },
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
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '20px',
                    padding: '8px 20px',
                    textTransform: 'none',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '30px',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-3px)',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 700,
                },
            },
        },
    },
});

export default imdbProTheme;