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
       🎨 ICON MAPPING (FIXED)
       - Now supports "Ligeras precipitaciones"
    ===================================================== */
    function getWeatherIcon(text = "") {
        const t = text.toLowerCase();

        if (t.includes("sol") || t.includes("despejado") || t.includes("clear"))
            return "fa-sun";

        if (t.includes("parcial"))
            return "fa-cloud-sun";

        /* ☁ CLOUD / OVERCAST */
        if (
            t.includes("nube") ||
            t.includes("nublado") ||
            t.includes("cubierto") ||
            t.includes("overcast") ||
            t.includes("cloud")
        ) return "fa-cloud";

        /* 🌧 RAIN (FIXED HERE) */
        if (
            t.includes("lluvia") ||
            t.includes("llovizna") ||
            t.includes("precipitaciones") ||   // ✅ FIX
            t.includes("light rain") ||        // ✅ FIX
            t.includes("drizzle") ||
            t.includes("rain")
        ) return "fa-cloud-rain";

        /* ⛈ STORM */
        if (t.includes("tormenta") || t.includes("storm"))
            return "fa-bolt";

        /* ❄ SNOW */
        if (t.includes("nieve"))
            return "fa-snowflake";

        /* 🌫 FOG */
        if (t.includes("niebla") || t.includes("neblina"))
            return "fa-smog";

        return "fa-question";
    }


    /* =====================================================
       🌦 WEATHER THEME SYSTEM
    ===================================================== */
    function getWeatherTheme(text = "") {
        const t = text.toLowerCase();

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
            t.includes("cielo claro") ||
            t.includes("sunny")
        ) return "theme-sunny";

        return "theme-cloud";
    }


    /* =====================================================
       📅 DATE FORMATTER
    ===================================================== */
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
       🌍 DESCRIPTION HELPER
    ===================================================== */
    function getDescription(obj) {
        return obj?.lang_es?.[0]?.value ||
               obj?.weatherDesc?.[0]?.value ||
               "";
    }


    /* =====================================================
       🧱 RENDER FUNCTIONS
    ===================================================== */
    function renderCurrent(city, current) {
        const desc = getDescription(current);

        DOM.current.innerHTML = `
            <h2>Tiempo en ${city}</h2>

            <p>
                <i class="fa-solid ${getWeatherIcon(desc)}"></i>
                ${desc}
            </p>

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

        const html = days.map((day, index) => {

            const morning = day.hourly.find(h => h.time === "900") || day.hourly[3];
            const evening = day.hourly.find(h => h.time === "1800") || day.hourly[6];

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

        DOM.forecast.innerHTML = html;
    }


    /* =====================================================
       🌐 LOAD WEATHER
    ===================================================== */
    async function loadWeather(city) {
        try {
            const res = await fetch(`https://wttr.in/${city}?format=j1&lang=es`);

            if (!res.ok) throw new Error("API error");

            const data = await res.json();
            const current = data.current_condition?.[0];

            if (!current) throw new Error("No weather data");

            const weatherText = current.weatherDesc?.[0]?.value || "";

            const theme = getWeatherTheme(weatherText);

            document.querySelectorAll(
                ".window.current, .window.details, .window.forecast, .top-window, .window.search"
            ).forEach(el => {

                el.classList.remove(
                    "theme-sunny",
                    "theme-rain",
                    "theme-cloud",
                    "theme-storm"
                );

                el.classList.add(theme);
            });

            renderCurrent(city, current);
            renderDetails(current);
            renderForecast(data.weather);

        } catch (error) {

            console.error("Weather error:", error);

            DOM.current.innerHTML = `<p>❌ Error al cargar el clima</p>`;
            DOM.details.innerHTML = "";
            DOM.forecast.innerHTML = "";
        }
    }


    /* =====================================================
       🔎 EVENTS
    ===================================================== */
    function handleSearch() {
        const city = DOM.cityInput.value.trim() || "Madrid";
        loadWeather(city);
    }

    DOM.searchBtn.addEventListener("click", handleSearch);

    DOM.cityInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleSearch();
    });


    /* =====================================================
       🚀 INIT
    ===================================================== */
    loadWeather("Madrid");

});

// sw.js
const CACHE_NAME = "clima-cache-v1";

const ASSETS = [
    "/",
    "/index.html",
    "/styles/weatherstyle.css",
    "/scripts/weatherscript.js",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css",
    "https://unpkg.com/7.css"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request);
        })
    );
});

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js")
        .then(() => console.log("Service Worker registered"))
        .catch(err => console.error("SW error:", err));
}