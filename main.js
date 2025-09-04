// main.js - Dynamic features for Online Food Ordering Application

document.addEventListener('DOMContentLoaded', () => {
    let menuItems = [];
    const cart = [];
    const menuContainer = document.getElementById('menu-items');

    // Load menu items from local menu.json
    fetch('menu.json')
        .then(response => response.json())
        .then(data => {
            menuItems = data;
            renderMenu();
        })
        .catch(() => {
            menuContainer.innerHTML = '<p>Failed to load menu items.</p>';
        });

    function renderMenu() {
        menuContainer.innerHTML = '';
        // Group items by category
        const categories = {};
        menuItems.forEach(item => {
            if (!categories[item.category]) categories[item.category] = [];
            categories[item.category].push(item);
        });
        // Helper to group by base name
        function groupByBaseName(items, baseNames) {
            const groups = {};
            items.forEach(item => {
                let found = false;
                for (const base of baseNames) {
                    if (item.name.toLowerCase().includes(base)) {
                        if (!groups[base]) groups[base] = [];
                        groups[base].push(item);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    if (!groups[item.name]) groups[item.name] = [];
                    groups[item.name].push(item);
                }
            });
            return groups;
        }
        Object.keys(categories).forEach(category => {
            const section = document.createElement('div');
            section.className = 'menu-category';
            section.innerHTML = `<h2>${category}</h2>`;
            let items = categories[category];
            // Only group dropdowns for mains
            if (category === 'Mains') {
                const baseNames = ['quesadilla', 'burrito', 'tacos'];
                const groups = groupByBaseName(items, baseNames);
                Object.keys(groups).forEach(base => {
                    if (groups[base].length > 1) {
                        // Dropdown for similar items
                        const dropdownDiv = document.createElement('div');
                        dropdownDiv.className = 'menu-dropdown';
                        dropdownDiv.innerHTML = `<label>${base.charAt(0).toUpperCase() + base.slice(1)}:</label> <select class="menu-select"><option value="">Choose an option</option></select> <span class="menu-price"></span> <button class="menu-add" disabled>Add to Cart</button>`;
                        const select = dropdownDiv.querySelector('.menu-select');
                        const priceSpan = dropdownDiv.querySelector('.menu-price');
                        const addBtn = dropdownDiv.querySelector('.menu-add');
                        groups[base].forEach(item => {
                            const opt = document.createElement('option');
                            opt.value = item.id;
                            opt.textContent = item.name + ` ($${item.price.toFixed(2)})`;
                            select.appendChild(opt);
                        });
                        select.addEventListener('change', () => {
                            const selectedId = parseInt(select.value);
                            const selectedItem = groups[base].find(i => i.id === selectedId);
                            if (selectedItem) {
                                priceSpan.textContent = `$${selectedItem.price.toFixed(2)}`;
                                addBtn.disabled = false;
                            } else {
                                priceSpan.textContent = '';
                                addBtn.disabled = true;
                            }
                        });
                        addBtn.addEventListener('click', () => {
                            const selectedId = parseInt(select.value);
                            const selectedItem = groups[base].find(i => i.id === selectedId);
                            if (selectedItem) {
                                const cartItem = cart.find(c => c.id === selectedItem.id);
                                if (cartItem) {
                                    cartItem.qty += 1;
                                } else {
                                    cart.push({ ...selectedItem, qty: 1 });
                                }
                                renderCart();
                            }
                        });
                        section.appendChild(dropdownDiv);
                    } else {
                        // Single item
                        groups[base].forEach(item => {
                            const itemDiv = document.createElement('div');
                            itemDiv.innerHTML = `
                                <h3>${item.name}</h3>
                                <p>Price: $${item.price.toFixed(2)}</p>
                                <button data-id="${item.id}">Add to Cart</button>
                            `;
                            section.appendChild(itemDiv);
                        });
                    }
                });
            } else {
                items.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.innerHTML = `
                        <h3>${item.name}</h3>
                        <p>Price: $${item.price.toFixed(2)}</p>
                        <button data-id="${item.id}">Add to Cart</button>
                    `;
                    section.appendChild(itemDiv);
                });
            }
            menuContainer.appendChild(section);
        });
    }

    // Add to cart event
    menuContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const id = parseInt(e.target.getAttribute('data-id'));
            const item = menuItems.find(m => m.id === id);
            const cartItem = cart.find(c => c.id === id);
            if (cartItem) {
                cartItem.qty += 1;
            } else {
                cart.push({ ...item, qty: 1 });
            }
            renderCart();
        }
    });
});

    // Render cart items
    function renderCart() {
        const cartContainer = document.getElementById('cart-items');
        cartContainer.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            total += item.price * item.qty;
            const itemDiv = document.createElement('div');
            itemDiv.innerHTML = `
                <h4>${item.name}</h4>
                <p>Qty: ${item.qty}</p>
                <p>Subtotal: $${(item.price * item.qty).toFixed(2)}</p>
                <button data-id="${item.id}" class="remove">Remove</button>
            `;
            cartContainer.appendChild(itemDiv);
        });
        document.getElementById('cart-total').textContent = `Total: $${total.toFixed(2)}`;
    }

    // Remove from cart event
    document.getElementById('cart-items').addEventListener('click', (e) => {
        if (e.target.classList.contains('remove')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            const index = cart.findIndex(c => c.id === id);
            if (index > -1) {
                cart.splice(index, 1);
                renderCart();
            }
        }
    });

    // Form validation and submission
    document.getElementById('order-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const address = document.getElementById('address').value.trim();
        if (!name || !address) {
            alert('Please fill in all fields.');
            return;
        }
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        // Submit order to backend
        fetch('http://localhost:3000/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, address, cart })
        })
        .then(res => res.json())
        .then(() => {
            alert(`Thank you, ${name}! Your order has been placed.`);
            cart.length = 0;
            renderCart();
            e.target.reset();
        })
        .catch(() => {
            alert('Failed to submit order. Please try again.');
        });
    });
