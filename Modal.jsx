import React, { useState } from "react";

const Modal = ({ onSave }) => {
  const [name, setName] = useState("");

  // Обработчик нажатия на кнопку "Сохранить"
  const handleSave = () => {
    const trimmedName = name.trim();
    if (trimmedName) {
      onSave(trimmedName);
    } else {
      alert("Пожалуйста, введите ваше имя");
    }
  };

  return (
    // Полупрозрачный фон, по центру - окно ввода имени
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white text-black p-6 rounded shadow-lg max-w-xs w-full">
        <h2 className="text-xl font-bold mb-4 text-center">Введите ваше имя</h2>
        <input
          type="text"
          placeholder="Ваше имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded"
        />
        <button
          onClick={handleSave}
          className="bg-black text-white w-full py-2 rounded"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
};

export default Modal;
