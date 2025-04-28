document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <p>Товар ID: ${item.id}</p>
            <p>Количество: ${item.quantity}</p>
            <button data-id="${item.id}" class="remove-item">Удалить</button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    // Удаление товара из корзины
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            removeFromCart(productId);
        });
    });
});

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    location.reload(); // Обновляем страницу
}