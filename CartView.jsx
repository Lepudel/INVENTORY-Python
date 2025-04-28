import React, { useState } from "react";
import PDFGenerator from "../utils/PDFGenerator";

const CartView = ({ cart, setCart, userName, onConfirmOrder }) => {
  const [projectName, setProjectName] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false); // Флаг подтверждения заказа

  // Увеличение количества товара в корзине (не больше доступного остатка)
  const increase = (id) => {
    const updated = cart.map((item) =>
      item.id === id && item.quantity < item.quantityAvailable
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    setCart(updated);
  };

  // Уменьшение количества товара в корзине (не меньше 1)
  const decrease = (id) => {
    const updated = cart.map((item) =>
      item.id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    setCart(updated);
  };

  // Удаление товара из корзины
  const remove = (id) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
  };

  // Подтверждение заказа: генерация PDF и обновление остатков на сервере
  const confirmOrder = async () => {
    if (!Array.isArray(cart) || cart.length === 0) {
      alert("Корзина пуста. Нечего экспортировать.");
      return;
    }

    try {
      // Генерация PDF-файла с деталями заказа
      PDFGenerator(cart, userName, projectName, deliveryDate, returnDate);
      alert("PDF успешно сгенерирован!");

      // Обновление остатков на сервере (если передана функция обновления)
      if (onConfirmOrder) {
        await onConfirmOrder();
        setIsOrderConfirmed(true); // Флаг, что заказ подтверждён
        alert("Заказ подтвержден, остатки обновлены!");
      }
    } catch (error) {
      console.error("Ошибка при обработке заказа:", error);
      alert("Ошибка при обработке заказа. Проверьте данные и попробуйте снова.");
    }
  };

  return (
    <div className="pb-28 px-4">
      {/* Список товаров в корзине */}
      {cart.map((item) => (
        <div
          key={item.id}
          className="bg-white text-black rounded-xl shadow p-4 mb-4 flex items-center"
        >
          {/* Изображение товара */}
          <img
            src={item.imageURLs[0]}
            alt={item.name}
            className="w-16 h-16 object-cover rounded mr-4"
          />
          <div className="flex-1">
            <h3 className="font-bold text-lg">{item.name}</h3>
            {/* Отображаем доступное количество для товара */}
            <p className="text-sm text-gray-700 mb-2">Доступно: {item.quantityAvailable}</p>
            <div className="flex items-center gap-3 mt-2">
              {/* Кнопка уменьшения количества */}
              <button
                onClick={() => decrease(item.id)}
                className="bg-black text-white rounded-full w-8 h-8"
              >
                −
              </button>
              {/* Текущее количество в корзине */}
              <span>{item.quantity}</span>
              {/* Кнопка увеличения количества (заблокирована, если достигнут максимум или товар недоступен) */}
              <button
                onClick={() => increase(item.id)}
                className="bg-black text-white rounded-full w-8 h-8"
                disabled={item.quantity >= item.quantityAvailable || item.quantityAvailable <= 0}
              >
                +
              </button>
            </div>
          </div>
          {/* Кнопка удаления товара из корзины */}
          <button
            onClick={() => remove(item.id)}
            className="text-red-600 font-bold text-xl ml-4"
          >
            ×
          </button>
        </div>
      ))}

      {/* Поля ввода дополнительных данных заказа */}
      <input
        type="text"
        placeholder="Название проекта"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        className="w-full mb-2 px-4 py-2 rounded text-black"
      />
      <input
        type="date"
        placeholder="Дата отгрузки"
        value={deliveryDate}
        onChange={(e) => setDeliveryDate(e.target.value)}
        className="w-full mb-2 px-4 py-2 rounded text-black"
      />
      <input
        type="date"
        placeholder="Дата возврата"
        value={returnDate}
        onChange={(e) => setReturnDate(e.target.value)}
        className="w-full mb-4 px-4 py-2 rounded text-black"
      />

      {/* Кнопка подтверждения заказа */}
      <button
        onClick={confirmOrder}
        className="w-full bg-white text-black font-semibold px-6 py-3 rounded-full"
        disabled={isOrderConfirmed}
      >
        {isOrderConfirmed ? "Заказ подтвержден" : "Экспортировать в PDF и подтвердить заказ"}
      </button>
    </div>
  );
};

export default CartView;
