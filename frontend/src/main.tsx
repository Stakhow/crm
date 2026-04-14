import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter, Routes, Route } from 'react-router';
import ClientsPage from './routes/ClientsPage.tsx';
import ClientFormPage from './routes/ClientFormPage.tsx';
import HomePage from './routes/HomePage.tsx';
import { NotificationProvider } from './components/NotificationContext';
import ClientPage from './routes/ClientPage.tsx';
import Page404 from './routes/404';
import OrderPage from './routes/OrderPage.tsx';
import ProductsPage from './routes/ProductsPage.tsx';
import { createTheme, ThemeProvider } from '@mui/material';
import ProductPage from './routes/ProductPage.tsx';
import ProductPageNew from './routes/ProductPageNew.tsx';
import OrderPageNew from './routes/OrderNewPage.tsx';
import OrdersPage from './routes/OrdersPage.tsx';
import CartPage from './routes/CartPage.tsx';
import ModifiersPage from './routes/ModifiersPage.tsx';

const customTheme = createTheme({
    typography: {
        fontFamily: ['SN Pro', 'sans-serif'].join(','),
        htmlFontSize: 15,
    },
    colorSchemes: {
        dark: true,
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                        display: 'none',
                    },
                    '& input[type=number]': {
                        MozAppearance: 'textfield',
                    },
                },
            },
        },
    },
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={customTheme} defaultMode="system">
            <BrowserRouter basename="/crm/">
                <App>
                    <NotificationProvider>
                        <Routes>
                            <Route index path="/" element={<HomePage />} />
                            <Route path="clients">
                                <Route index element={<ClientsPage />} />
                                <Route path=":id">
                                    <Route index element={<ClientPage />} />
                                    <Route path="order" element={<OrderPage />} />
                                </Route>
                                <Route path="new" element={<ClientFormPage />} />
                                <Route path="edit">
                                    <Route index element={<ClientFormPage />} />
                                    <Route path=":id" element={<ClientFormPage />} />
                                </Route>
                            </Route>

                            <Route path="products">
                                <Route index element={<ProductsPage />} />
                                <Route path=":id" element={<ProductPage />} />
                                <Route path="new" element={<ProductPageNew />} />
                            </Route>

                            <Route path="orders">
                                <Route index element={<OrdersPage />} />
                                <Route path=":id" element={<OrderPage />} />
                                <Route path="new">
                                    <Route index element={<OrderPageNew />} />
                                    <Route path=":id" element={<OrderPageNew />} />
                                </Route>
                            </Route>

                            <Route path="cart" element={<CartPage />} />

                            <Route path="modifiers" element={<ModifiersPage />} />

                            <Route path="*" element={<Page404 />} />
                        </Routes>
                    </NotificationProvider>
                </App>
            </BrowserRouter>
        </ThemeProvider>
    </StrictMode>,
);
