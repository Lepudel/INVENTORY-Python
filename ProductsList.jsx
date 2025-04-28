import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductsList = ({ cart, setCart, filter, setFilter, expandedCategories, toggleCategory }) => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [tempQuantities, setTempQuantities] = useState({});
  const [categories, setCategories] = useState({});
  const [isMenuOpen, setMenuOpen] = useState(false);

  // Получение товаров с сервера при загрузке компонента
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/products");
        console.log("Данные с сервера:", response.data); // Лог данных с сервера

        if (response.data && response.data.length > 0) {
          setProducts(response.data);

          // Генерация структуры категорий и подкатегорий
          const categoryMap = {};
          response.data.forEach((product) => {
            const categoryParts = product.category.split("/").map((part) => part.trim());
            let currentLevel = categoryMap;
            categoryParts.forEach((part, index) => {
              if (!currentLevel[part]) {
                currentLevel[part] = index === categoryParts.length - 1 ? [] : {};
              }
              currentLevel = currentLevel[part];
            });
          });
          setCategories(categoryMap);
        }
      } catch (error) {
        console.error("Ошибка при загрузке товаров с сервера:", error);
      }
    };

    fetchProducts();
  }, []);

  // Увеличение желаемого количества для товара (в пределах доступного остатка)
  const increase = (id, maxQty) => {
    setTempQuantities((prev) => {
      const newQty = (prev[id] || 0) + 1;
      return { ...prev, [id]: newQty > maxQty ? maxQty : newQty };
    });
  };

  // Уменьшение желаемого количества для товара (не ниже 0)
  const decrease = (id) => {
    setTempQuantities((prev) => {
      const newQty = (prev[id] || 0) - 1;
      return { ...prev, [id]: newQty < 0 ? 0 : newQty };
    });
  };

  // Добавление товара в корзину
  const addToCart = (product) => {
    const addQty = tempQuantities[product.id] || 0;
    if (addQty === 0) return; // если количество не выбрано, ничего не делаем

    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      // Обновляем количество, не превышая доступного остатка
      const updated = cart.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity:
                item.quantity + addQty > product.quantityAvailable
                  ? product.quantityAvailable
                  : item.quantity + addQty,
            }
          : item
      );
      setCart(updated);
    } else {
      // Добавляем новый товар в корзину, ограничивая количеством на складе
      setCart([
        ...cart,
        {
          ...product,
          quantity: addQty > product.quantityAvailable ? product.quantityAvailable : addQty,
        },
      ]);
    }

    // Сбрасываем временно выбранное количество для этого товара
    setTempQuantities((prev) => ({ ...prev, [product.id]: 0 }));
  };

  // Фильтрация товаров по выбранной категории и строке поиска
  const filtered = products
    .filter((p) => {
      if (filter) {
        const categoryParts = p.category.split("/").map((part) => part.trim().toLowerCase());
        // Оставляем товар, если его категория (с подкатегориями) начинается с фильтра
        return categoryParts.join("/").startsWith(filter.toLowerCase());
      }
      return true;
    })
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  // Рекурсивная функция для отображения дерева категорий
  const renderCategories = (categoriesObj, path = "", level = 0) => {
    return Object.keys(categoriesObj).map((category) => {
      const newPath = path ? `${path}/${category}` : category;
      const isExpanded = expandedCategories[newPath];

      return (
        <div key={newPath} className="flex flex-col" style={{ paddingLeft: `${level * 10}px` }}>
          <button
            onClick={() => {
              toggleCategory(newPath);
              // При клике на категорию устанавливаем или снимаем фильтр по ней
              setFilter(filter === newPath ? "" : newPath);
            }}
            className={`px-3 py-1 border rounded mb-2 category-button ${
              filter === newPath ? "selected" : ""
            } ${level > 0 ? "subcategory-button" : ""}`}
          >
            {category}
          </button>
          {/* Если категория раскрыта, отображаем её подкатегории */}
          {isExpanded && renderCategories(categoriesObj[category], newPath, level + 1)}
        </div>
      );
    });
  };

  return (
    <div className="flex">
      {/* Боковая панель с категориями (скрывается на маленьких экранах) */}
      <div className="category-container hidden md:block">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="px-3 py-2 bg-black text-white rounded"
        >
          {isMenuOpen ? "Скрыть меню" : "Показать меню"}
        </button>
        {/* Отображение дерева категорий при открытом меню */}
        {isMenuOpen && renderCategories(categories)}
      </div>

      {/* Основная область с товарами */}
      <div className="content-container flex-1 pb-28 px-4">
        {/* Поле поиска по товарам */}
        <input
          type="text"
          placeholder="Поиск"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded text-black"
        />

        {/* Сетка карточек отфильтрованных товаров */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.length > 0 ? (
            filtered.map((product) => {
              const isUnavailable = product.quantityAvailable === 0; // признак отсутствия на складе

              return (
                <div
                  key={product.id}
                  className={`card ${
                    isUnavailable ? "bg-gray-300 text-gray-500 pointer-events-none" : "bg-white text-black"
                  }`}
                >
                  {/* Изображение товара */}
                  <img
                    src={product.imageURLs[0]}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1 text-center">
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <p className="text-sm text-gray-700 mb-2">{product.description}</p>
                    {/* Остаток: показывает число или "Нет в наличии" */}
                    <p className="text-sm text-gray-700">
                      Остаток: {product.quantityAvailable >= 0 ? product.quantityAvailable : "Нет в наличии"}
                    </p>
                    {/* Всего в компании: изначальное количество (столбец D) */}
                    <p className="text-sm text-gray-700">Всего в компании: {product.quantity}</p>
                    {/* Блок управления количеством и добавления в корзину (скрыт, если нет в наличии) */}
                    {!isUnavailable && (
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <button
                          onClick={() => decrease(product.id)}
                          className="bg-black text-white rounded-full w-8 h-8"
                        >
                          −
                        </button>
                        <span>{tempQuantities[product.id] || 0}</span>
                        <button
                          onClick={() => increase(product.id, product.quantityAvailable)}
                          className="bg-black text-white rounded-full w-8 h-8"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Кнопка добавления в корзину (скрыта, если нет в наличии) */}
                  {!isUnavailable && (
                    <button
                      onClick={() => addToCart(product)}
                      className="mt-3 bg-black text-white w-full py-2 rounded-full"
                    >
                      Добавить в корзину
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            // Сообщение, если товаров для текущего фильтра нет
            <div className="text-center text-white col-span-full">
              Нет товаров для отображения по выбранному фильтру
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsList;