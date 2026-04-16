import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { NavLink, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import { Badge, Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Stack } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useColorScheme } from '@mui/material/styles';
import { cartStore } from '../store/';

interface Props {
    /**
     * Injected by the documentation to work in an iframe.
     * You won't need it on your project.
     */
    window?: () => Window;
    children: React.ReactNode;
}

const drawerWidth = 240;
const navItems = [
    { title: 'Головна', to: '/' },
    { title: 'Клієнти', to: '/clients' },
    { title: 'Додати Клієнта', to: '/clients/new' },
    { title: 'Продукти', to: '/products' },
    { title: 'Додати Продукт', to: '/products/new' },
    { title: 'Замовлення', to: '/orders' },
    { title: 'Нове Замовлення', to: '/orders/new' },
    { title: 'Корзина', to: '/cart' },
    { title: 'Модифікатори', to: '/modifiers' },
];

export default function App(props: Props) {
    const { children } = props;
    const [mobileOpen, setMobileOpen] = useState(false);

    const { mode, setMode } = useColorScheme();
    const { pathname } = useLocation();

    const fetchData = cartStore((state) => state.getCartToView);
    const cartData = cartStore((state) => state.data);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    const drawer = (
        <Stack
            direction={'column'}
            justifyContent={'space-between'}
            onClick={handleDrawerToggle}
            sx={{ textAlign: 'center' }}
        >
            <Typography variant="h6" sx={{ my: 2 }}>
                CRM
            </Typography>
            <Divider />
            <List sx={{ ml: 1, flex: 1 }}>
                {navItems.map((item, idx) => (
                    <ListItem key={idx} disablePadding>
                        <Button
                            end
                            to={item.to}
                            component={NavLink}
                            sx={{
                                textAlign: 'center',

                                '&.active': {
                                    border: '1px solid',
                                    fontWeight: 700,
                                },
                            }}
                        >
                            <ListItemButton sx={{ textAlign: 'center' }}>{item.title}</ListItemButton>
                        </Button>
                    </ListItem>
                ))}
            </List>

            <Divider />

            <FormControl sx={{ mt: 2, p: 2 }}>
                <FormLabel sx={{ mb: 1 }} id="color-theme-toggle">
                    Тема
                </FormLabel>
                <RadioGroup
                    aria-labelledby="color-theme-toggle"
                    name="theme-toggle"
                    row
                    value={mode}
                    onChange={(event) => setMode(event.target.value as 'light' | 'dark')}
                >
                    <FormControlLabel value="system" control={<Radio />} label="Системна" />
                    <FormControlLabel value="light" control={<Radio />} label="Світла" />
                    <FormControlLabel value="dark" control={<Radio />} label="Темна" />
                </RadioGroup>
            </FormControl>
        </Stack>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar component="nav">
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, display: { xs: 'inline-block', md: 'none' } }}
                    >
                        {navItems.find((i) => i.to === pathname)?.title}
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {navItems.map((item, idx) => (
                            <Button
                                component={NavLink}
                                to={item.to}
                                key={idx}
                                sx={{ my: 2, color: 'white', display: 'block' }}
                            >
                                <ListItemButton sx={{ textAlign: 'center' }}>{item.title}</ListItemButton>
                            </Button>
                        ))}
                    </Box>

                    {!!cartData && (
                        <IconButton
                            component={NavLink}
                            to="/cart"
                            size="large"
                            aria-label="show 4 new mails"
                            color="inherit"
                        >
                            <Badge badgeContent={cartData.quantity} color="error">
                                <ShoppingCartIcon />
                            </Badge>
                        </IconButton>
                    )}
                </Toolbar>
            </AppBar>
            <nav>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                        },
                    }}
                >
                    {drawer}
                </Drawer>
            </nav>
            <Box component="main" sx={{ p: 1, width: '100%' }}>
                {children}
            </Box>
        </Box>
    );
}
