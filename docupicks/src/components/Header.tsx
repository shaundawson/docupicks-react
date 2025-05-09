import { AppBar, Toolbar, TextField, Button, Box } from '@mui/material';
import type { HeaderProps } from '../types';

interface HeaderProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    handleSearch: (e: React.FormEvent) => void;
}

export const Header = ({ searchTerm, setSearchTerm, handleSearch }: HeaderProps) => (
    <AppBar position="static">
        <Toolbar>
            <Box component="form" onSubmit={handleSearch} display="flex" width="100%" gap={2}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search documentaries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ backgroundColor: 'white', borderRadius: 1 }}
                />
                <Button type="submit" variant="contained" color="secondary">
                    Search
                </Button>
            </Box>
        </Toolbar>
    </AppBar>
);