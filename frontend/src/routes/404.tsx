import { useNavigate, useLocation, Link } from 'react-router';
import { Box, Button, Typography } from '@mui/material';
import { NotFoundImg } from '../components/NotFound';

export default function Page404() {
    const { state } = useLocation();

    return (
        <>
            {!!state && !!state.message && <Typography variant={'h4'} children={state.message} textAlign={'center'} />}

            <NotFoundImg />

            <Box m={3} textAlign={'center'}>
                {!!state && !!state.linkTo ? (
                    <Link to={state.linkTo}>
                        <Button variant="contained">{state.linkText}</Button>
                    </Link>
                ) : (
                    <Link to={'/'}>
                        <Button variant="contained">На Головну</Button>
                    </Link>
                )}
            </Box>
        </>
    );
}
