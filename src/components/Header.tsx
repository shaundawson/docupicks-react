import { AppBar, Toolbar, Box, Typography, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import type { HeaderProps } from '../types';

export const Header = ({ toggleTheme, isDarkTheme }: HeaderProps) => (
    <AppBar
        position="fixed"
        elevation={0}
        sx={{
            backgroundColor: '#121212',
            width: '100%',
            top: 0,
            left: 0,
            right: 0,
            zIndex: (theme) => theme.zIndex.drawer + 1,
            height: '48px', // Fixed height
            borderBottom: 'none',
            boxShadow: 'none !important'
        }}
    >
        <Toolbar
            sx={{
                padding: '0 !important',
                minHeight: '48px !important',
                margin: '0 auto',
                maxWidth: '1600px',
                width: '100%',
                justifyContent: 'space-between'
            }}
        >
            {/* Left section - Logo */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                paddingLeft: '12px'
            }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        color: '#ffffff',
                        fontSize: '1.5rem',
                        lineHeight: '48px' // Vertically center text
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
                paddingRight: '12px'
            }}>
                <IconButton
                    onClick={toggleTheme}
                    size="small"
                    sx={{
                        color: '#ffffff',
                        padding: '8px',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.08)'
                        }
                    }}
                >
                    {isDarkTheme ? (
                        <Brightness7Icon sx={{ fontSize: '1.5rem' }} />
                    ) : (
                        <Brightness4Icon sx={{ fontSize: '1.5rem' }} />
                    )}
                </IconButton>
            </Box>
        </Toolbar>
    </AppBar>
);
