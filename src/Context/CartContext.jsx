// Kjo faqe osht bo per me i rujt biletat e zgjedhura nga useri te pjesa e SeatsPage kur te navigon te CartPage
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = sessionStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    sessionStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Shto ulëse të reja
  const addSeats = (seats) => {
    setCart((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const newSeats = seats.filter((s) => !existingIds.has(s.id));
      return [...prev, ...newSeats];
    });
  };

  // Fshi një ulëse
  const removeSeat = (seatId) => {
    setCart((prev) => prev.filter((s) => s.id !== seatId));
  };

  // Përditëso emrin/mbiemrin e pasagjerit
  const updatePassenger = (seatId, field, value) => {
    setCart((prev) =>
      prev.map((s) => (s.id === seatId ? { ...s, [field]: value } : s)),
    );
  };

  // Pastro cart-in pas konfirmimit
  const clearCart = () => {
    setCart([]);
    sessionStorage.removeItem("cart");
  };

  const total = cart.reduce((sum, s) => sum + s.price, 0);

  return (
    <CartContext.Provider
      value={{ cart, addSeats, removeSeat, updatePassenger, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
