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
import { Badge, Button } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { cartService } from '../../backend';

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
    const [cart, setCart] = useState<{
        quantity: number;
    }>();

    const { pathname } = useLocation();

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    useEffect(() => {
        cartService.getCartToView().then((data) => {
            setCart(data);
        });
    }, []);

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                CRM
            </Typography>
            <Divider />
            <List sx={{ ml: 1 }}>
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
        </Box>
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

                    {!!cart && cart.quantity > 0 && (
                        <IconButton
                            component={NavLink}
                            to="/cart"
                            size="large"
                            aria-label="show 4 new mails"
                            color="inherit"
                        >
                            <Badge badgeContent={cart.quantity} color="error">
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
