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
       🎨 ICON MAPPING
    ===================================================== */
    function getWeatherIcon(text = "") {
        const t = text.toLowerCase();

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

        if (t.includes("lluvia") || t.includes("llovizna") || t.includes("rain"))
            return "fa-cloud-rain";

        if (t.includes("tormenta") || t.includes("storm"))
            return "fa-bolt";

        if (t.includes("nieve"))
            return "fa-snowflake";

        if (t.includes("niebla") || t.includes("neblina"))
            return "fa-smog";

        return "fa-question";
    }


    /* =====================================================
       🌦 WEATHER THEME SYSTEM (FIXED + EXPANDED)
       - FIX: handles Argentina / wttr.in variations
    ===================================================== */
    function getWeatherTheme(text = "") {
        const t = text.toLowerCase();

        /* 🌧 Rain */
        if (
            t.includes("lluvia") ||
            t.includes("rain") ||
            t.includes("llovizna")
        ) return "theme-rain";

        /* ⛈ Storm */
        if (
            t.includes("tormenta") ||
            t.includes("storm") ||
            t.includes("thunder")
        ) return "theme-storm";

        /* ☁ Cloud */
        if (
            t.includes("nube") ||
            t.includes("nublado") ||
            t.includes("cubierto") ||
            t.includes("overcast") ||
            t.includes("cloud") ||
            t.includes("parcial")
        ) return "theme-cloud";

        /* ☀ SUNNY (FIXED — THIS WAS YOUR BUG) */
        if (
            t.includes("sol") ||
            t.includes("despejado") ||
            t.includes("clear") ||
            t.includes("cielo claro") ||
            t.includes("sunny")
        ) return "theme-sunny";

        /* fallback */
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

            /* =================================================
               🎨 APPLY THEME (FIXED)
            ================================================= */
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

            DOM.current.innerHTML = `
                <p>❌ Error al cargar el clima</p>
            `;

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