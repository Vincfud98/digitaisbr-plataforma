import { describe, it, expect } from 'vitest';
import cartReducer, { addToCart, updateQuantity, removeFromCart, clearCart } from './cartSlice';

const item = { productId: 'p1', name: 'Produto A', price: 29.90, quantity: 1, image: '' };

describe('cartSlice', () => {
  const empty = { items: [], storeSlug: null };

  it('adds item to cart', () => {
    const state = cartReducer(empty, addToCart({ item, storeSlug: 'loja-1' }));
    expect(state.items).toHaveLength(1);
    expect(state.storeSlug).toBe('loja-1');
  });

  it('increments quantity for same product', () => {
    let state = cartReducer(empty, addToCart({ item, storeSlug: 'loja-1' }));
    state = cartReducer(state, addToCart({ item: { ...item, quantity: 2 }, storeSlug: 'loja-1' }));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
  });

  it('clears cart when adding from different store', () => {
    let state = cartReducer(empty, addToCart({ item, storeSlug: 'loja-1' }));
    state = cartReducer(state, addToCart({ item: { ...item, productId: 'p2' }, storeSlug: 'loja-2' }));
    expect(state.items).toHaveLength(1);
    expect(state.storeSlug).toBe('loja-2');
  });

  it('updates quantity', () => {
    let state = cartReducer(empty, addToCart({ item, storeSlug: 'loja-1' }));
    state = cartReducer(state, updateQuantity({ productId: 'p1', quantity: 5 }));
    expect(state.items[0].quantity).toBe(5);
  });

  it('removes item when quantity is 0', () => {
    let state = cartReducer(empty, addToCart({ item, storeSlug: 'loja-1' }));
    state = cartReducer(state, updateQuantity({ productId: 'p1', quantity: 0 }));
    expect(state.items).toHaveLength(0);
    expect(state.storeSlug).toBeNull();
  });

  it('removes item by id', () => {
    let state = cartReducer(empty, addToCart({ item, storeSlug: 'loja-1' }));
    state = cartReducer(state, removeFromCart('p1'));
    expect(state.items).toHaveLength(0);
  });

  it('clears all items', () => {
    let state = cartReducer(empty, addToCart({ item, storeSlug: 'loja-1' }));
    state = cartReducer(state, clearCart());
    expect(state.items).toHaveLength(0);
    expect(state.storeSlug).toBeNull();
  });
});
