import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter, Routes, Route } from 'react-router';
import Clients from './routes/Clients.tsx';
import ClientForm from './routes/ClientForm';
import Home from './routes/home';
import { NotificationProvider } from './components/NotificationContext';
import ClientPage from './routes/Client.tsx';
import Page404 from './routes/404';
import Order from './routes/Order';
import Products from './routes/Products.tsx';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import Product from './routes/Product.tsx';
import ProductNew from './routes/ProductNew.tsx';
import OrderNew from './routes/OrderNew.tsx';
import Orders from './routes/Orders.tsx';
import Cart from './routes/Cart.tsx';

const customTheme = createTheme({
    typography: {
        fontFamily: ['SN Pro', 'sans-serif'].join(','),
    },
    palette: {
        background: {
            default: '#f0f0f0', // Your desired color
            paper: '#fafafa', // Color for Paper components
        },
    },
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={customTheme}>
            {/* <CssBaseline /> */}
            <BrowserRouter>
                <App>
                    <NotificationProvider>
                        <Routes>
                            <Route index path="/" element={<Home />} />
                            <Route path="clients">
                                <Route index element={<Clients />} />
                                <Route path=":id">
                                    <Route index element={<ClientPage />} />
                                    <Route path="order" element={<Order />} />
                                </Route>
                                <Route path="new" element={<ClientForm />} />
                                <Route path="edit">
                                    <Route index element={<ClientForm />} />
                                    <Route path=":id" element={<ClientForm />} />
                                </Route>
                            </Route>

                            <Route path="products">
                                <Route index element={<Products />} />
                                <Route path=":id" element={<Product />} />
                                <Route path="new" element={<ProductNew />} />
                            </Route>

                            <Route path="orders">
                                <Route index element={<Orders />} />
                                <Route path=":id" element={<Order />} />
                                <Route path="new">
                                    <Route index element={<OrderNew />} />
                                    <Route path=":id" element={<OrderNew />} />
                                </Route>
                            </Route>

                            <Route path="cart" element={<Cart />} />

                            <Route path="*" element={<Page404 />} />
                        </Routes>
                    </NotificationProvider>
                </App>
            </BrowserRouter>
        </ThemeProvider>
    </StrictMode>,
);
