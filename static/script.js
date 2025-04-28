document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.querySelector('.product-grid');

    // Загружаем товары из API
    fetch('/products')
        .then(response => response.json())
        .then(products => {
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <p>Остаток: ${product.quantityAvailable}</p>
                    <button data-id="${product.id}" class="add-to-cart">Добавить в корзину</button>
                `;
                productGrid.appendChild(productCard);
            });

            // Добавляем обработчики для кнопок
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = e.target.dataset.id;
                    addToCart(productId);
                });
            });
        });
});

// Добавляет товар в корзину (сохраняет в localStorage)
function addToCart(productId) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Товар добавлен в корзину');
}