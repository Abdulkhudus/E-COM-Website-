"use client";
// contexts/CartContext.tsx — placeholder
import { createContext, useContext } from "react";

const CartContext = createContext({});

export function CartProvider({ children }: { children: React.ReactNode }) {
  return <CartContext.Provider value={{}}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
