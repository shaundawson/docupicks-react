import { Box, Typography } from '@mui/material';

export const Footer = () => (
    <Box component="footer" sx={{ py: 3, mt: 'auto', bgcolor: 'background.paper' }}>
        <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} DocuPicks — Data from OMDB API
        </Typography>
    </Box>
);