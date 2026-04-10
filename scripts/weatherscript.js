document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // 🔗 DOM ELEMENTS
    // =========================
    const cityInput = document.getElementById("cityInput");
    const searchBtn = document.getElementById("searchBtn");


    // =========================
    // 🎨 WEATHER ICON MAPPING
    // (Font Awesome helper)
    // =========================
    function getWeatherIcon(text) {
        const t = text.toLowerCase();

        if (t.includes("sun") || t.includes("clear")) return "fa-sun";
        if (t.includes("partly")) return "fa-cloud-sun";
        if (t.includes("cloud")) return "fa-cloud";
        if (t.includes("rain") || t.includes("drizzle")) return "fa-cloud-rain";
        if (t.includes("thunder")) return "fa-bolt";
        if (t.includes("snow")) return "fa-snowflake";
        if (t.includes("fog") || t.includes("mist")) return "fa-smog";

        return "fa-question";
    }


    // =========================
    // 📅 DATE FORMATTING
    // Adds "Hoy / Mañana" labels
    // =========================
    function formatDateLabel(dateString, index) {
        const date = new Date(dateString);

        // Convert to dd-mm-yy (Spanish format)
        const formatted = date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit"
        });

        // Human-friendly labels
        if (index === 0) return `📍 Hoy (${formatted})`;
        if (index === 1) return `⏭ Mañana (${formatted})`;

        return `📅 ${formatted}`;
    }


    // =========================
    // 🌦 LOAD WEATHER DATA
    // Uses wttr.in JSON API
    // =========================
    async function loadWeather(city) {
        try {

            // 🌐 Fetch weather data
            const res = await fetch(`https://wttr.in/${city}?format=j1`);
            const data = await res.json();

            const current = data.current_condition[0];

            // =========================
            // 🌡 CURRENT WEATHER WINDOW
            // =========================
            document.getElementById("current").innerHTML = `
        <h2>${city}</h2>

        <p>
          <i class="fa-solid ${getWeatherIcon(current.weatherDesc[0].value)}"></i>
          ${current.weatherDesc[0].value}
        </p>

        <p>🌡 Temperatura: ${current.temp_C}°C</p>
      `;


            // =========================
            // 📊 DETAILS WINDOW
            // =========================
            document.getElementById("details").innerHTML = `
        <p>💨 Viento: ${current.windspeedKmph} km/h</p>
        <p>💧 Humedad: ${current.humidity}%</p>
        <p>📈 Presión: ${current.pressure} mb</p>
        <p>👁 Visibilidad: ${current.visibility} km</p>
      `;


            // =========================
            // 📅 FORECAST WINDOW
            // =========================
            let html = "";

            data.weather.forEach((day, index) => {

                // ⏰ Try to find morning & evening slots safely
                const morning =
                    day.hourly.find(h => h.time === "900") || day.hourly[3];

                const evening =
                    day.hourly.find(h => h.time === "1800") || day.hourly[6];

                html += `
          <div class="forecast-card">

            <h3>${formatDateLabel(day.date, index)}</h3>

            <p>🌡 Máx: ${day.maxtempC}°C</p>
            <p>🌡 Mín: ${day.mintempC}°C</p>
            <p>🌤 Media: ${day.avgtempC}°C</p>

            <hr>

            <p>
              <i class="fa-solid ${getWeatherIcon(morning.weatherDesc[0].value)}"></i>
              🌅 Mañana: ${morning.weatherDesc[0].value}
            </p>

            <p>
              <i class="fa-solid ${getWeatherIcon(evening.weatherDesc[0].value)}"></i>
              🌇 Tarde: ${evening.weatherDesc[0].value}
            </p>

            <p>💨 Viento máx: ${day.maxwindspeedKmph} km/h</p>

          </div>
        `;
            });

            document.getElementById("forecast").innerHTML = html;


        } catch (err) {

            // =========================
            // ❌ ERROR HANDLING
            // =========================
            console.error(err);

            document.getElementById("current").innerHTML = `
        <p>❌ Error al cargar el clima</p>
        <p>Verifica el nombre de la ciudad</p>
      `;

            document.getElementById("details").innerHTML = "";
            document.getElementById("forecast").innerHTML = "";
        }
    }


    // =========================
    // 🔎 SEARCH EVENTS
    // =========================

    // Click search button
    searchBtn.addEventListener("click", () => {
        const city = cityInput.value.trim() || "Madrid";
        loadWeather(city);
    });

    // Press Enter to search
    cityInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            searchBtn.click();
        }
    });


    // =========================
    // 🚀 INITIAL LOAD
    // =========================
    loadWeather("Madrid");

});