const productsData = {
    cocktail: {
        title: "Протеиновый коктейль",
        price: 100,
        image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80",
        description: "Питательный коктейль с высоким содержанием сывороточного белка (WPC-80) для восстановления мышц после интенсивной тренировки.",
        specs: [
            { label: "Объем", val: "400 мл" },
            { label: "Содержание белка", val: "30 г" },
            { label: "Вкусы", val: "Шоколад, Ваниль, Клубника, Банан" },
            { label: "Калорийность", val: "180 ккал" }
        ]
    },
    shaker: {
        title: "Фирменный шейкер GymFit",
        price: 250,
        image: "https://whey.kz/wp-content/uploads/2018/05/sheyker-600-2-v-1-avgit.jpg",
        description: "Стильный герметичный шейкер с сеточкой для идеального смешивания протеиновых и BCAA напитков без комочков.",
        specs: [
            { label: "Объем", val: "700 мл" },
            { label: "Материал", val: "Пищевой пластик BPA-Free" },
            { label: "Комплектация", val: "Шейкер + стальной шарик-венчик" },
            { label: "Цвет", val: "Матовый черный с фирменным логотипом" }
        ]
    },
    trainer: {
        title: "Персональная тренировка",
        price: 500,
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
        description: "Индивидуальное занятие с топовым сертифицированным тренером клуба. Подбор персональной программы, постановка техники и рекомендации по питанию.",
        specs: [
            { label: "Длительность", val: "60 минут" },
            { label: "Формат", val: "1-на-1 с тренером" },
            { label: "Направление", val: "Силовая, кардио, Кроссфит или растяжка" },
            { label: "Срок действия", val: "30 дней с момента обмена" }
        ]
    }
};

let currentModalProductKey = null;

function isLastMondayOfMonth(dateObj) {
    if (dateObj.getDay() !== 1) return false;
    const nextWeek = new Date(dateObj);
    nextWeek.setDate(dateObj.getDate() + 7);
    return nextWeek.getMonth() !== dateObj.getMonth();
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTabBtn = document.getElementById('loginTabBtn');
    const registerTabBtn = document.getElementById('registerTabBtn');

    if (tab === 'login') {
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';
        loginTabBtn.classList.add('active');
        registerTabBtn.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'flex';
        registerTabBtn.classList.add('active');
        loginTabBtn.classList.remove('active');
    }
}

function showModal(title, message) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');

    if (modal && modalTitle && modalMessage) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.add('active');
    }
}

function openProductModal(key) {
    const product = productsData[key];
    if (!product) return;

    currentModalProductKey = key;

    document.getElementById('pmImage').src = product.image;
    document.getElementById('pmTitle').textContent = product.title;
    document.getElementById('pmPrice').textContent = `⭐ ${product.price} баллов`;
    document.getElementById('pmDescription').textContent = product.description;

    const specsList = document.getElementById('pmSpecsList');
    specsList.innerHTML = '';
    product.specs.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${item.label}:</strong> ${item.val}`;
        specsList.appendChild(li);
    });

    const pmBuyBtn = document.getElementById('pmBuyBtn');
    pmBuyBtn.onclick = () => {
        closeProductModal();
        buyShopItem(product.title, product.price);
    };

    document.getElementById('productModal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

function addWorkoutPoints() {
    const activeEmail = localStorage.getItem('gymfit_active_email');
    if (activeEmail === 'Kirill') {
        showModal('Администратор', 'У вас бесконечные баллы!');
        return;
    }

    if (activeEmail) {
        let userData = JSON.parse(localStorage.getItem('gymfit_user_' + activeEmail));
        if (userData) {
            const today = new Date().toISOString().slice(0, 10);
            
            if (userData.lastWorkoutDate !== today) {
                userData.lastWorkoutDate = today;
                userData.workoutCountToday = 0;
            }

            if ((userData.workoutCountToday || 0) >= 2) {
                showModal('Лимит достигнут', 'Вы уже получили баллы за 2 тренировки сегодня! Приходите завтра.');
                return;
            }

            userData.workoutCountToday = (userData.workoutCountToday || 0) + 1;
            userData.points = (userData.points || 0) + 50;
            
            localStorage.setItem('gymfit_user_' + activeEmail, JSON.stringify(userData));
            updatePointsDisplay();
            showModal('Отличная работа!', `Вам начислено +50 бонусов за тренировку! (${userData.workoutCountToday}/2 за сегодня)`);
        }
    }
}

function buyShopItem(itemName, cost) {
    const activeEmail = localStorage.getItem('gymfit_active_email');
    if (!activeEmail) return;

    if (activeEmail === 'Kirill') {
        showModal('Успешно!', `Вы безлимитно получили: ${itemName}`);
        return;
    }

    let userData = JSON.parse(localStorage.getItem('gymfit_user_' + activeEmail));
    if (userData) {
        const currentPoints = userData.points || 0;
        if (currentPoints < cost) {
            showModal('Недостаточно баллов', `Для покупки "${itemName}" нужно ${cost} баллов. У вас: ${currentPoints}.`);
            return;
        }

        userData.points = currentPoints - cost;
        localStorage.setItem('gymfit_user_' + activeEmail, JSON.stringify(userData));
        updatePointsDisplay();
        showModal('Поздравляем с покупкой!', `Вы успешно обменяли ${cost} баллов на "${itemName}". Покажите это сообщение на рецепции.`);
    }
}

function buyPass(passName) {
    showModal('Абонемент выбран!', `Вы выбрали тариф "${passName}". Ждем вас в клубе!`);
}

function updatePointsDisplay() {
    const activeEmail = localStorage.getItem('gymfit_active_email');
    const pointsEl = document.getElementById('userPoints');
    const priceElements = document.querySelectorAll('.price-val');

    if (activeEmail === 'Kirill') {
        if (pointsEl) pointsEl.textContent = '∞';
        priceElements.forEach(el => {
            el.textContent = '0 ₸';
            el.style.color = '#28a745';
        });
    } else if (activeEmail) {
        const userData = JSON.parse(localStorage.getItem('gymfit_user_' + activeEmail));
        if (pointsEl && userData) {
            pointsEl.textContent = userData.points || 0;
        }
        priceElements.forEach(el => {
            el.textContent = el.getAttribute('data-base');
            el.style.color = '#fff';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Автоматически обновляем картинку шейкера в карточке магазина при загрузке
    const shopCards = document.querySelectorAll('.shop-card');
    if (shopCards[1]) {
        const cardImg = shopCards[1].querySelector('.card-photo img');
        if (cardImg) {
            cardImg.src = productsData.shaker.image;
            cardImg.alt = productsData.shaker.title;
        }
    }

    const authScreen = document.getElementById('authScreen');
    const mainSiteContent = document.getElementById('mainSiteContent');
    const isLogged = localStorage.getItem('gymfit_logged');

    if (isLogged === 'true') {
        authScreen.style.display = 'none';
        mainSiteContent.style.display = 'block';
        updatePointsDisplay();
    } else {
        authScreen.style.display = 'flex';
        mainSiteContent.style.display = 'none';
    }

    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const trainer = document.getElementById('bookingTrainer').value;
            const dateVal = document.getElementById('bookingDate').value;
            const timeVal = document.getElementById('bookingTime').value;

            const selectedDate = new Date(dateVal);

            if (isLastMondayOfMonth(selectedDate)) {
                showModal('Ошибка записи', 'Выбранная дата является санитарным днем (последний понедельник месяца). Клуб закрыт.');
                return;
            }

            const [hours] = timeVal.split(':').map(Number);
            if (hours < 7 || hours >= 23) {
                showModal('Ошибка записи', 'Клуб работает с 07:00 до 23:00. Выберите доступное время.');
                return;
            }

            showModal('Запись подтверждена!', `Вы успешно записаны к тренеру ${trainer} на ${dateVal} в ${timeVal}. Ждем вас!`);
            bookingForm.reset();
        });
    }

    const registerForm = document.getElementById('registerForm');
    const regError = document.getElementById('regError');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value.trim();

            if (email === 'Kirill' || localStorage.getItem('gymfit_user_' + email)) {
                regError.textContent = 'Этот email занят или недоступен!';
                return;
            }

            const newUser = {
                name: name,
                email: email,
                password: password,
                points: 100,
                lastWorkoutDate: '',
                workoutCountToday: 0
            };

            localStorage.setItem('gymfit_user_' + email, JSON.stringify(newUser));
            localStorage.setItem('gymfit_logged', 'true');
            localStorage.setItem('gymfit_active_email', email);

            authScreen.style.display = 'none';
            mainSiteContent.style.display = 'block';
            updatePointsDisplay();
        });
    }

    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputLogin = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            if (inputLogin === 'Kirill' && password === 'Kirill777') {
                localStorage.setItem('gymfit_logged', 'true');
                localStorage.setItem('gymfit_active_email', 'Kirill');

                authScreen.style.display = 'none';
                mainSiteContent.style.display = 'block';
                updatePointsDisplay();
                return;
            }

            const savedUserJson = localStorage.getItem('gymfit_user_' + inputLogin);
            if (!savedUserJson) {
                loginError.textContent = 'Пользователь не найден!';
                return;
            }

            const user = JSON.parse(savedUserJson);
            if (user.password !== password) {
                loginError.textContent = 'Неверный пароль!';
                return;
            }

            localStorage.setItem('gymfit_logged', 'true');
            localStorage.setItem('gymfit_active_email', inputLogin);

            authScreen.style.display = 'none';
            mainSiteContent.style.display = 'block';
            updatePointsDisplay();
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('gymfit_logged');
            localStorage.removeItem('gymfit_active_email');
            location.reload();
        });
    }

    const menuBtn = document.getElementById('menuBtn');
    const navMenu = document.getElementById('navMenu');

    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    const closeModal = document.getElementById('closeModal');
    const modalOkBtn = document.getElementById('modalOkBtn');
    const closeProductModalBtn = document.getElementById('closeProductModal');

    if (closeModal) closeModal.addEventListener('click', () => document.getElementById('modal').classList.remove('active'));
    if (modalOkBtn) modalOkBtn.addEventListener('click', () => document.getElementById('modal').classList.remove('active'));
    if (closeProductModalBtn) closeProductModalBtn.addEventListener('click', closeProductModal);

    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal')) {
            document.getElementById('modal').classList.remove('active');
        }
        if (e.target === document.getElementById('productModal')) {
            closeProductModal();
        }
    });
});