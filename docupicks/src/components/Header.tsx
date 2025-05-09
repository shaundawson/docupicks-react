import { AppBar, Toolbar, TextField, Button, Box, Typography } from '@mui/material';
import type { HeaderProps } from '../types';

export const Header = ({ searchTerm, setSearchTerm, handleSearch }: HeaderProps) => (
    <AppBar position="sticky" sx={{ background: '#000', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
        <Toolbar sx={{ gap: 2, py: 1 }}>
            {/* IMDb-style logo text */}
            <Typography variant="h6" sx={{
                fontWeight: 700,
                color: 'primary.main',
                letterSpacing: '-0.5px',
                mr: 3
            }}>
                DOCUPICKS
            </Typography>

            {/* Search form with preserved functionality */}
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
                                borderColor: 'primary.main',
                            },
                            '&:hover fieldset': {
                                borderColor: 'primary.light',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                                borderWidth: 2,
                            },
                        }
                    }}
                    InputProps={{
                        endAdornment: (
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
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
        </Toolbar>
    </AppBar>
);