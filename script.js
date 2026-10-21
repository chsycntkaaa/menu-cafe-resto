// Data Produk Kafe
const menus = [
    {
        id: 1,
        name: "Kopi Susu",
        category: "coffee",
        price: 15000,
        desc: "Espresso pilihan dengan fresh milk segar dan gula aren asli yang legit.",
        img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=500&q=80",
        status: "Tersedia"
    },
    {
        id: 2,
        name: "Caramel Macchiato",
        category: "coffee",
        price: 18000,
        desc: "Paduan espresso, susu lembut, dan sirup karamel manis.",
        img: "https://images.unsplash.com/photo-1485808190072-f004b173be84?auto=format&fit=crop&w=500&q=80",
        status: "Tersedia"
    },
    {
        id: 3,
        name: "Matcha Latte",
        category: "non-coffee",
        price: 20000,
        desc: "Bubuk matcha premium Jepang asli diseduh dengan susu segar.",
        img: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=500&q=80",
        status: "Tersedia"
    },
    {
        id: 4,
        name: "Chocolate Regal",
        category: "non-coffee",
        price: 18000,
        desc: "Susu cokelat lezat berpadu dengan remahan biskuit Marie Regal.",
        img: "https://images.unsplash.com/photo-1543253687-c931c8e01820?auto=format&fit=crop&w=500&q=80",
        status: "Habis"
    },
    {
        id: 5,
        name: "Croissant Butter",
        category: "food",
        price: 18000,
        desc: "Pastry renyah di luar, lembut dan berongga mentega khas Prancis.",
        img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80",
        status: "Tersedia"
    },
    {
        id: 6,
        name: "French Fries Special",
        category: "food",
        price: 15000,
        desc: "Kentang goreng renyah disajikan dengan bumbu gurih dan saus.",
        img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=500&q=80",
        status: "Tersedia"
    }
];

// Keranjang Simpanan ({ id: jumlah })
let cart = {};
let currentCategory = 'all';

const menuListEl = document.getElementById('menuList');
const emptyStateEl = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const cartBar = document.getElementById('cartBar');
const cartModal = document.getElementById('cartModal');

// Format angka ke mata uang Rupiah
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
}

// Tambah/Kurang jumlah menu (+1 / -1)
function changeQty(id, delta) {
    if (!cart[id]) cart[id] = 0;
    cart[id] += delta;

    if (cart[id] <= 0) {
        delete cart[id];
    }

    updateUI();
}

// Update seluruh tampilan (List Menu & Floating Cart)
function updateUI() {
    applyFilterAndSearch();
    updateCartBar();
}

// Tampilkan daftar menu
function displayMenus(items) {
    menuListEl.innerHTML = '';
    if (items.length === 0) {
        emptyStateEl.style.display = 'block';
        return;
    }
    emptyStateEl.style.display = 'none';

    items.forEach(item => {
        const qty = cart[item.id] || 0;
        const card = document.createElement('div');
        card.className = 'menu-card';
        
        card.innerHTML = `
            <img src="${item.img}" alt="${item.name}" class="menu-img">
            <div class="menu-info">
                <div class="menu-title">${item.name}</div>
                <div class="menu-desc">${item.desc}</div>
                <div class="menu-footer">
                    <span class="menu-price">${formatRupiah(item.price)}</span>
                    ${
                        item.status === 'Tersedia'
                        ? `
                            <div class="quantity-control">
                                ${qty > 0 ? `<button class="btn-qty" onclick="changeQty(${item.id}, -1)">-</button>` : ''}
                                ${qty > 0 ? `<span class="qty-number">${qty}</span>` : ''}
                                <button class="btn-qty" onclick="changeQty(${item.id}, 1)">+</button>
                            </div>
                          `
                        : `<span class="badge-out">Habis</span>`
                    }
                </div>
            </div>
        `;
        menuListEl.appendChild(card);
    });
}

// Update Bar Keranjang Belanja Melayang
function updateCartBar() {
    let totalItems = 0;
    let totalPrice = 0;

    for (const id in cart) {
        const item = menus.find(m => m.id == id);
        if (item) {
            totalItems += cart[id];
            totalPrice += item.price * cart[id];
        }
    }

    if (totalItems > 0) {
        document.getElementById('cartCount').innerText = `${totalItems} Pesanan Dipilih`;
        document.getElementById('cartTotal').innerText = formatRupiah(totalPrice);
        cartBar.classList.remove('hidden');
    } else {
        cartBar.classList.add('hidden');
    }
}

// Filter Kategori
function filterMenu(category, event) {
    currentCategory = category;
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    applyFilterAndSearch();
}

// Filter Pencarian
function applyFilterAndSearch() {
    const keyword = searchInput.value.toLowerCase();
    const filtered = menus.filter(item => {
        const matchCategory = currentCategory === 'all' || item.category === currentCategory;
        const matchKeyword = item.name.toLowerCase().includes(keyword) || item.desc.toLowerCase().includes(keyword);
        return matchCategory && matchKeyword;
    });

    displayMenus(filtered);
}

searchInput.addEventListener('input', applyFilterAndSearch);

// Buka Modal Ringkasan Pesanan (Checkout)
function openCartModal() {
    const cartItemsList = document.getElementById('cartItemsList');
    cartItemsList.innerHTML = '';
    
    let totalPrice = 0;
    let waMessageText = "Halo Kak! Saya mau pesan menu berikut:\n\n";

    for (const id in cart) {
        const item = menus.find(m => m.id == id);
        if (item) {
            const itemTotal = item.price * cart[id];
            totalPrice += itemTotal;

            // Buat Tampilan Per Baris
            const row = document.createElement('div');
            row.className = 'cart-item-row';
            row.innerHTML = `
                <div>
                    <div class="cart-item-name">${item.name} (${cart[id]}x)</div>
                    <div class="cart-item-price">${formatRupiah(item.price)} / porsi</div>
                </div>
                <div style="font-weight:700;">${formatRupiah(itemTotal)}</div>
            `;
            cartItemsList.appendChild(row);

            // Susun Teks Pesanan untuk WhatsApp
            waMessageText += `• *${item.name}* x${cart[id]} = ${formatRupiah(itemTotal)}\n`;
        }
    }

    document.getElementById('modalTotalPrice').innerText = formatRupiah(totalPrice);
    waMessageText += `\n*Total Tagihan:* ${formatRupiah(totalPrice)}\n\nMohon diproses ya kak, terima kasih!`;

    // Buat Link WhatsApp
    const phone = "6285815721138"; // Ganti dengan Nomor WhatsApp Kasir Kafe kamu
    document.getElementById('waCheckoutBtn').href = `https://wa.me/${phone}?text=${encodeURIComponent(waMessageText)}`;

    cartModal.classList.add('active');
}

function closeCartModal(e) {
    if (e.target === cartModal) cartModal.classList.remove('active');
}

function closeCartModalDirect() {
    cartModal.classList.remove('active');
}

// Jalankan aplikasi saat halaman dimuat
updateUI();
