import { AppBar, Toolbar, Box, Typography, IconButton, useTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import type { HeaderProps } from '../types';

/**
 * Header component
 * ----------------
 * Uses theme colors for seamless integration with the rest of the app.
 */
export const Header = ({ toggleTheme, isDarkTheme }: HeaderProps) => {
    const theme = useTheme();

    // Set text/icon color based on theme mode
    const headerTextColor = theme.palette.mode === 'dark' ? '#fff' : '#181818';

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                backgroundColor: theme.palette.background.paper,
                width: '100%',
                top: 0,
                left: 0,
                right: 0,
                zIndex: theme.zIndex.drawer + 1,
                height: '56px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                borderBottom: 'none',
            }}
        >
            <Toolbar
                sx={{
                    padding: '0 !important',
                    minHeight: '56px !important',
                    margin: '0 auto',
                    maxWidth: '1600px',
                    width: '100%',
                    justifyContent: 'space-between',
                    position: 'relative',
                    zIndex: 3,
                }}
            >
                {/* Left section - Logo */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                    paddingLeft: '16px'
                }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 900,
                            color: headerTextColor, // Explicit black or white
                            fontSize: '1.6rem',
                            letterSpacing: '2px',
                            lineHeight: '56px',
                            textShadow: theme.palette.mode === 'dark'
                                ? '0 1px 4px #000'
                                : 'none', // Remove shadow in light mode for clarity
                            borderBottom: `2px solid ${theme.palette.primary.main}`,
                            display: 'inline-block',
                            pb: '2px'
                        }}
                    >
                        DOCUPICKS
                    </Typography>
                </Box>

                {/* Right section - Theme Toggle */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                    paddingRight: '16px'
                }}>
                    <IconButton
                        onClick={toggleTheme}
                        size="large"
                        sx={{
                            color: headerTextColor, // Explicit black or white
                            padding: '8px',
                            '&:hover': {
                                backgroundColor: theme.palette.action.hover
                            }
                        }}
                        aria-label="Toggle light/dark theme"
                    >
                        {isDarkTheme ? (
                            <Brightness7Icon sx={{ fontSize: '1.6rem' }} />
                        ) : (
                            <Brightness4Icon sx={{ fontSize: '1.6rem' }} />
                        )}
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
};
