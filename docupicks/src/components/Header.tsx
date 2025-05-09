import {
    AppBar,
    Toolbar,
    TextField,
    Button,
    Box,
    Typography,
    IconButton
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import type { HeaderProps } from '../types';

export const Header = ({
    searchTerm,
    setSearchTerm,
    handleSearch,
    toggleTheme,
    isDarkTheme
}: HeaderProps) => (
    <AppBar position="sticky" color="primary">
        <Toolbar sx={{ gap: 2, py: 1 }}>
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 700,
                    color: 'primary.contrastText',
                    letterSpacing: '-0.5px',
                    mr: 3
                }}
            >
                DOCUPICKS
            </Typography>

            <Box component="form" onSubmit={handleSearch} sx={{ flexGrow: 1 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search documentaries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '30px',
                            backgroundColor: 'background.paper',
                            '& fieldset': {
                                borderColor: 'secondary.main',
                            },
                            '&:hover fieldset': {
                                borderColor: 'secondary.light',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'secondary.main',
                                borderWidth: 2,
                            },
                        }
                    }}
                    InputProps={{
                        endAdornment: (
                            <Button
                                type="submit"
                                variant="contained"
                                color="secondary"
                                sx={{
                                    borderRadius: '20px',
                                    px: 3,
                                    py: 0.5,
                                    textTransform: 'none',
                                    fontWeight: 700
                                }}
                            >
                                Search
                            </Button>
                        )
                    }}
                />
            </Box>

            <IconButton
                onClick={toggleTheme}
                color="inherit"
                sx={{
                    color: 'primary.contrastText',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                }}
            >
                {isDarkTheme ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
        </Toolbar>
    </AppBar>
);