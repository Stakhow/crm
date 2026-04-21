import { cartStore, categoryStore, productStore } from '../../../store';
import { ProductListSelect } from '../Product/ProductListSelect';
import { CartProductCard } from './CartProductCard';

export const CartProductListSelect = () => {
    const { cart } = cartStore((s) => s);
    const { categoryName } = categoryStore((s) => s);
    const { product } = productStore((s) => s);
    const cartItemsId = !!cart ? cart.items.map((i) => i.productId) : [];

    return !!categoryName ? (
        <>
            <ProductListSelect categoryName={categoryName} cartItemsId={cartItemsId} />
            {!!product && !cartItemsId.includes(product.id) && <CartProductCard product={product} />}
        </>
    ) : (
        <></>
    );
};
