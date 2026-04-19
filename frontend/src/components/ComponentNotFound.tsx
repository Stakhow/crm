import { Card, Typography, Stack, Button } from '@mui/material';
import { NavLink } from 'react-router';

export type ComponentNotFoundProps = { title?: string; buttonText?: string; link?: string };
export const ComponentNotFound = ({ title, buttonText, link }: ComponentNotFoundProps) => (
    <Card sx={{ p: 2 }} raised>
        {title && (
            <Typography textAlign={'center'} variant="h6">
                {title}
            </Typography>
        )}

        {buttonText && link && (
            <Stack useFlexGap my={3}>
                <Button variant="contained" fullWidth component={NavLink} to={link}>
                    {buttonText}
                </Button>
            </Stack>
        )}
    </Card>
);
