document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       🔗 DOM REFERENCES
    ===================================================== */
    const DOM = {
        cityInput: document.getElementById("cityInput"),
        searchBtn: document.getElementById("searchBtn"),
        current: document.getElementById("current"),
        details: document.getElementById("details"),
        forecast: document.getElementById("forecast")
    };


    /* =====================================================
       🧠 CONSTANTS
    ===================================================== */
    const THEMES = ["theme-sunny", "theme-rain", "theme-cloud", "theme-storm"];


    /* =====================================================
       🔧 UTILS
    ===================================================== */

    function normalizeText(text = "") {
        return text.toLowerCase();
    }

    function getDescription(obj) {
        return obj?.lang_es?.[0]?.value ||
               obj?.weatherDesc?.[0]?.value ||
               "";
    }

    function formatDateLabel(dateString, index) {
        const date = new Date(dateString);

        const formatted = date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit"
        });

        if (index === 0) return `📍 Hoy (${formatted})`;
        if (index === 1) return `⏭ Mañana (${formatted})`;

        return `📅 ${formatted}`;
    }


    /* =====================================================
       🌦 WEATHER CLASSIFICATION
    ===================================================== */

    function getWeatherIcon(text = "") {
        const t = normalizeText(text);

        if (t.includes("sol") || t.includes("despejado") || t.includes("clear"))
            return "fa-sun";

        if (t.includes("parcial"))
            return "fa-cloud-sun";

        if (
            t.includes("nube") ||
            t.includes("nublado") ||
            t.includes("cubierto") ||
            t.includes("overcast") ||
            t.includes("cloud")
        ) return "fa-cloud";

        if (
            t.includes("lluvia") ||
            t.includes("llovizna") ||
            t.includes("precipitaciones") ||
            t.includes("light rain") ||
            t.includes("drizzle") ||
            t.includes("rain")
        ) return "fa-cloud-rain";

        if (t.includes("tormenta") || t.includes("storm"))
            return "fa-bolt";

        if (t.includes("nieve"))
            return "fa-snowflake";

        if (t.includes("niebla") || t.includes("neblina"))
            return "fa-smog";

        return "fa-question";
    }


    function getWeatherTheme(text = "") {
        const t = normalizeText(text);

        if (t.includes("lluvia") || t.includes("rain") || t.includes("llovizna") || t.includes("precipitaciones"))
            return "theme-rain";

        if (t.includes("tormenta") || t.includes("storm") || t.includes("thunder"))
            return "theme-storm";

        if (
            t.includes("nube") ||
            t.includes("nublado") ||
            t.includes("cubierto") ||
            t.includes("overcast") ||
            t.includes("cloud")
        ) return "theme-cloud";

        if (
            t.includes("sol") ||
            t.includes("despejado") ||
            t.includes("clear") ||
            t.includes("sunny")
        ) return "theme-sunny";

        return "theme-cloud";
    }


    /* =====================================================
       🎨 THEME SYSTEM
    ===================================================== */

    function applyTheme(theme) {
        const elements = document.querySelectorAll(
            ".window.current, .window.details, .window.forecast, .top-window, .window.search"
        );

        elements.forEach(el => {
            el.classList.remove(...THEMES);
            el.classList.add(theme);
        });
    }


    /* =====================================================
       🧱 RENDERERS
    ===================================================== */

    function renderCurrent(city, current) {
        const desc = getDescription(current);

        DOM.current.innerHTML = `
            <h2>Tiempo en ${city}</h2>
            <p><i class="fa-solid ${getWeatherIcon(desc)}"></i> ${desc}</p>
            <p>🌡 Temperatura: ${current.temp_C}°C</p>
        `;
    }


    function renderDetails(current) {
        DOM.details.innerHTML = `
            <p>💨 Viento: ${current.windspeedKmph} km/h</p>
            <p>💧 Humedad: ${current.humidity}%</p>
            <p>📈 Presión: ${current.pressure} mb</p>
            <p>👁 Visibilidad: ${current.visibility} km</p>
        `;
    }


    function renderForecast(days) {
        DOM.forecast.innerHTML = days.map((day, index) => {

            const morning = day.hourly.find(h => h.time === "900") || day.hourly[0];
            const evening = day.hourly.find(h => h.time === "1800") || day.hourly.at(-1);

            const morningDesc = getDescription(morning);
            const eveningDesc = getDescription(evening);

            return `
                <div class="forecast-card">
                    <h3>${formatDateLabel(day.date, index)}</h3>

                    <p>🌡 Máx: ${day.maxtempC}°C</p>
                    <p>🌡 Mín: ${day.mintempC}°C</p>
                    <p>🌤 Media: ${day.avgtempC}°C</p>

                    <hr>

                    <p>
                        <i class="fa-solid ${getWeatherIcon(morningDesc)}"></i>
                        🌅 Mañana: ${morningDesc}
                    </p>

                    <p>
                        <i class="fa-solid ${getWeatherIcon(eveningDesc)}"></i>
                        🌇 Tarde: ${eveningDesc}
                    </p>
                </div>
            `;
        }).join("");
    }


    /* =====================================================
       🌐 API
    ===================================================== */

    async function loadWeather(city) {
        try {
            const res = await fetch(`https://wttr.in/${city}?format=j1&lang=es`);
            if (!res.ok) throw new Error("API error");

            const data = await res.json();

            const current = data.current_condition?.[0];
            if (!current) throw new Error("No weather data");

            const theme = getWeatherTheme(getDescription(current));

            applyTheme(theme);

            renderCurrent(city, current);
            renderDetails(current);
            renderForecast(data.weather);

        } catch (err) {
            console.error("Weather error:", err);

            DOM.current.innerHTML = `<p>❌ Error al cargar el clima</p>`;
            DOM.details.innerHTML = "";
            DOM.forecast.innerHTML = "";
        }
    }


    /* =====================================================
       🎮 EVENTS
    ===================================================== */

    function initEvents() {

        function handleSearch() {
            const city = DOM.cityInput.value.trim() || "Madrid";
            loadWeather(city);
        }

        DOM.searchBtn.addEventListener("click", handleSearch);

        DOM.cityInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") handleSearch();
        });
    }


    /* =====================================================
       🚀 INIT
    ===================================================== */

    initEvents();
    loadWeather("Madrid");
});