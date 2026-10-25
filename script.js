console.log("javascript connected");

// --- Project Search Functionality ---
const projectSearch = document.getElementById("projectSearch");
const projectItems = document.querySelectorAll("#projectList li");
const projectSearchStatus = document.getElementById("projectSearchStatus");

function filterProjects() {
    if (!projectSearch) return;
    const term = projectSearch.value.trim().toLowerCase();
    let visibleCount = 0;

    projectItems.forEach(function (item) {
        const searchableText = item.textContent.toLowerCase();
        const matches = term === "" || searchableText.includes(term);
        item.hidden = !matches;
        item.style.display = matches ? "" : "none";
        if (matches) {
            visibleCount += 1;
        }
    });

    if (!projectSearchStatus) return;

    if (term === "") {
        projectSearchStatus.textContent = "";
        return;
    }

    if (visibleCount === 0) {
        projectSearchStatus.textContent =
            'No projects match "' + projectSearch.value.trim() + '".';
    } else {
        projectSearchStatus.textContent =
            visibleCount +
            (visibleCount === 1 ? " project" : " projects") +
            " found.";
    }
}

if (projectSearch) {
    projectSearch.addEventListener("input", filterProjects);
    projectSearch.addEventListener("search", filterProjects);
}

// --- Dark/Light Mode Theme System ---
const themeButtons = document.querySelectorAll(".theme-toggle-btn, #themeToggle, #floatingThemeToggle");

function updateThemeToggleButtons(isDark) {
    themeButtons.forEach(function (button) {
        button.setAttribute("aria-pressed", isDark ? "true" : "false");
        button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");

        const icon = button.querySelector(".theme-icon");
        const text = button.querySelector(".theme-text");

        if (icon) {
            icon.textContent = isDark ? "☀️" : "🌙";
        }
        if (text) {
            text.textContent = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
        }
        if (!icon && !text) {
            button.textContent = isDark ? "☀️ Switch to Light Mode" : "🌙 Switch to Dark Mode";
        }
    });
}

function applyTheme(isDark) {
    if (isDark) {
        document.documentElement.classList.add("dark-mode");
        document.body.classList.add("dark-mode");
    } else {
        document.documentElement.classList.remove("dark-mode");
        document.body.classList.remove("dark-mode");
    }

    // Update meta theme-color for browser navigation bar
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
        themeColorMeta = document.createElement("meta");
        themeColorMeta.name = "theme-color";
        document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute("content", isDark ? "#0f1013" : "#ffffff");

    updateThemeToggleButtons(isDark);
}

// Check saved preference or system preference on load
const savedTheme = localStorage.getItem("portfolio-theme");
if (savedTheme === "dark") {
    applyTheme(true);
} else if (savedTheme === "light") {
    applyTheme(false);
} else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    applyTheme(true);
} else {
    applyTheme(false);
}

// Bind click events to all theme toggle buttons
themeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const isCurrentlyDark = document.documentElement.classList.contains("dark-mode") ||
                                document.body.classList.contains("dark-mode");
        const newIsDark = !isCurrentlyDark;
        applyTheme(newIsDark);
        localStorage.setItem("portfolio-theme", newIsDark ? "dark" : "light");
    });
});

// React to OS dark/light mode preference changes if user hasn't explicitly set one
if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (event) {
        if (!localStorage.getItem("portfolio-theme")) {
            applyTheme(event.matches);
        }
    });
}

// --- Weather Feature ---
const cityInput = document.getElementById("cityInput");
const weatherButton = document.getElementById("weatherButton");
const weatherResult = document.getElementById("weatherResult");

async function getWeather() {
    if (!cityInput || !weatherResult) return;
    const city = cityInput.value.trim();

    if (!city) {
        weatherResult.innerHTML = '<p class="weather-alert">Please enter a city name.</p>';
        return;
    }

    weatherResult.innerHTML = '<p class="weather-loading">Loading weather for ' + city + '...</p>';

    const apiKey = "5c2c70848a1bcfa13745ed78b08d9a01";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);

        if (response.status === 404) {
            weatherResult.innerHTML = `<p class="weather-error">City "${city}" not found. Please check spelling.</p>`;
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const iconCode = data.weather?.[0]?.icon || "01d";
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const condition = data.weather[0].description;
        const capitalizedCondition = condition.charAt(0).toUpperCase() + condition.slice(1);

        weatherResult.innerHTML = `
            <div class="weather-card">
                <div class="weather-header">
                    <img src="${iconUrl}" alt="${condition}" class="weather-icon" width="60" height="60" />
                    <div>
                        <h3 class="weather-city">${data.name}, ${data.sys.country}</h3>
                        <p class="weather-condition">${capitalizedCondition}</p>
                    </div>
                </div>
                <div class="weather-details">
                    <span class="weather-temp">${temp}°C</span>
                    <span class="weather-sub">Feels like: ${feelsLike}°C</span>
                    <span class="weather-sub">Humidity: ${data.main.humidity}%</span>
                    <span class="weather-sub">Wind: ${Math.round(data.wind.speed * 3.6)} km/h</span>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Weather fetch error:", error);
        weatherResult.innerHTML = '<p class="weather-error">Unable to fetch weather. Please check your internet connection and try again.</p>';
    }
}

if (weatherButton) {
    weatherButton.addEventListener("click", getWeather);
}

if (cityInput) {
    cityInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            getWeather();
        }
    });
}