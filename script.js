document.addEventListener('DOMContentLoaded', function () {
    // Элементы DOM
    const themeToggle = document.getElementById('theme-toggle');
    const updateTimeElement = document.getElementById('update-time');
    const currencyCards = {
        usd: document.getElementById('usd'),
        eur: document.getElementById('eur'),
        btc: document.getElementById('btc')
    };

    // Проверяем сохраненную тему в localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.className = savedTheme;
        updateThemeIcon(savedTheme);
    }

    // Обработчик переключения темы
    themeToggle.addEventListener('click', toggleTheme);

    // Загружаем данные сразу при загрузке страницы
    fetchCurrencyData();

    // Устанавливаем интервал для автообновления (10 минут)
    setInterval(fetchCurrencyData, 10 * 60 * 1000);

    // Функция переключения темы
    function toggleTheme() {
        if (document.body.classList.contains('dark-theme')) {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            localStorage.setItem('theme', 'light-theme');
            updateThemeIcon('light-theme');
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark-theme');
            updateThemeIcon('dark-theme');
        }
    }

    // Функция обновления иконки темы
    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark-theme') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    async function fetchCurrencyData() {
        try {
            // Для рублевых курсов (USD и EUR) используем ЦБ РФ
            const cbrResponse = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
            const cbrData = await cbrResponse.json();

            // Для биткоина используем CoinGecko API (курс в USD)
            const cryptoResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
            const cryptoData = await cryptoResponse.json();

            // Обновляем время последнего обновления
            const now = new Date();
            updateTimeElement.textContent = now.toLocaleTimeString('ru-RU');

            // Обновляем данные валют
            updateCurrencyCard('usd', cbrData.Valute.USD);
            updateCurrencyCard('eur', cbrData.Valute.EUR);
            updateCurrencyCard('btc', cryptoData.bitcoin, true);

        } catch (error) {
            console.error('Ошибка при получении данных:', error);
            updateTimeElement.textContent = 'Ошибка загрузки данных';
        }
    }

    function updateCurrencyCard(currencyId, data, isCrypto = false) {
        const card = currencyCards[currencyId];
        const valueElement = card.querySelector('.currency-value');
        const changeElement = card.querySelector('.currency-change');

        if (isCrypto) {
            // Обработка данных для криптовалюты (Bitcoin) в USD
            const price = data.usd;
            const change = data.usd_24h_change;

            valueElement.textContent = `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

            if (change > 0) {
                changeElement.textContent = `+${change.toFixed(2)}%`;
                changeElement.className = 'currency-change positive';
            } else if (change < 0) {
                changeElement.textContent = `${change.toFixed(2)}%`;
                changeElement.className = 'currency-change negative';
            } else {
                changeElement.textContent = '0.00%';
                changeElement.className = 'currency-change neutral';
            }
        } else {
            // Обработка данных для фиатных валют (USD, EUR)
            const price = data.Value;
            const prevPrice = data.Previous;
            const change = ((price - prevPrice) / prevPrice) * 100;

            valueElement.textContent = `${price.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`;

            if (change > 0) {
                changeElement.textContent = `+${change.toFixed(2)}% (${(price - prevPrice).toFixed(2)} ₽)`;
                changeElement.className = 'currency-change positive';
            } else if (change < 0) {
                changeElement.textContent = `${change.toFixed(2)}% (${(price - prevPrice).toFixed(2)} ₽)`;
                changeElement.className = 'currency-change negative';
            } else {
                changeElement.textContent = '0.00% (0.00 ₽)';
                changeElement.className = 'currency-change neutral';
            }
        }
    }
});