import {
    AppBar,
    Toolbar,
    TextField,
    Button,
    Box,
    Typography,
    IconButton
} from '@mui/material';

// Import icons for theme toggle button
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Moon icon for dark mode
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Sun icon for light mode

// Import the type definition for the props used by this component
import type { HeaderProps } from '../types';

// Define and export the Header component
export const Header = ({
    searchTerm,       // The current value typed into the search field
    setSearchTerm,    // Function to update the search term
    handleSearch,     // Function called when the search form is submitted
    toggleTheme,      // Function to toggle between light and dark themes
    isDarkTheme       // Boolean that tells if the current theme is dark
}: HeaderProps) => (

    // Create a sticky top navigation bar using AppBar
    <AppBar position="sticky" color="primary">
        <Toolbar sx={{ gap: 2, py: 1 }}>

            {/* Logo or app name shown on the left side of the header */}
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

            {/* Search bar form that expands to fill available space */}
            <Box component="form" onSubmit={handleSearch} sx={{ flexGrow: 1 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search documentaries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} // Update input as user types
                    size="small"
                    sx={{
                        // Style the input field
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
                        // Add a "Search" button at the end of the text field
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

            {/* Theme toggle button (sun/moon icon based on current theme) */}
            <IconButton
                onClick={toggleTheme}  // Switch between light and dark mode
                color="inherit"
                sx={{
                    color: 'primary.contrastText',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)' // Light hover effect
                    }
                }}
            >
                {/* Show the appropriate icon depending on the current theme */}
                {isDarkTheme ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
        </Toolbar>
    </AppBar>
);