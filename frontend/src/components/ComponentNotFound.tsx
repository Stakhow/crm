import { Card, Typography, Stack, Button } from '@mui/material';
import { NavLink } from 'react-router';

type Props = { title: string; buttonText: string; link: string };
export const ComponentNotFound = ({ title, buttonText, link }: Props) => (
    <Card sx={{ p: 2 }} raised>
        <Typography textAlign={'center'} variant="h6">
            {title}
        </Typography>

        <Stack useFlexGap my={3}>
            <Button variant="contained" fullWidth component={NavLink} to={link}>
                {buttonText}
            </Button>
        </Stack>
    </Card>
);
