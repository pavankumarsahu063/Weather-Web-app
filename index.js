const apiKey = "fce037b6343d058cb64c4286aa55e169";
const weatherUrl = "https://api.openweathermap.org/data/2.5/weather";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";


const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchWeather');
const locationBtn = document.getElementById('getWeatherByLocation');
const weatherInfo = document.getElementById('weather-info');
const forecastDiv = document.getElementById('forecast');
const errorMsg = document.getElementById('error-msg');
const favoritesDiv = document.getElementById('favorites');
const favoriteList = document.getElementById('favorite-list');
const themeToggle = document.getElementById('themeToggle');


//Dark Mode
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    themeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
});



//Search Button
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherByCity(city);
    }
});

//Location Btn
locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            () => alert("Location access denied.")
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

//Get Weather
async function getWeatherByCity(city) {
    try {
        const res = await fetch(`${weatherUrl}?q=${city}&appid=${apiKey}&units=metric`);
        if (!res.ok) throw new Error("City not found");

        const data = await res.json();
        displayWeather(data);
        getForecast(data.coord.lat, data.coord.lon);
    } catch (error) {
        showError(error.message);
    }
}

async function getWeatherByCoords(lat, lon) {
    try {
        const res = await fetch(`${weatherUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        if (!res.ok) throw new Error("Location not found");

        const data = await res.json();
        displayWeather(data);
        getForecast(lat, lon);
    } catch (error) {
        showError(error.message);
    }
}


function displayWeather(data) {
    weatherInfo.classList.remove('hidden');
    errorMsg.classList.add('hidden');

    document.getElementById('city-name').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    document.getElementById('temperature').textContent = `Temperature: ${data.main.temp}°C`;
    document.getElementById('description').textContent = `Description: ${data.weather[0].description}`;
    document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `Wind Speed: ${data.wind.speed} m/s`;

    /
    const weatherCondition = data.weather[0].main.toLowerCase();
    document.body.className = weatherCondition;
}


async function getForecast(lat, lon) {
    try {
        const res = await fetch(`${forecastUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        if (!res.ok) throw new Error("Forecast not found");

        const data = await res.json();
        displayForecast(data.list);
    } catch (error) {
        console.error("Error fetching forecast:", error);
    }
}


function displayForecast(forecast) {
    forecastDiv.classList.remove('hidden');
    forecastDiv.innerHTML = `<h2>5-Day Forecast</h2>`;

    const dailyForecast = forecast.filter((item, index) => index % 8 === 0);

    dailyForecast.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        const temp = item.main.temp;
        const desc = item.weather[0].description;
        const icon = item.weather[0].icon;

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <p>${date}</p>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}">
            <p>${temp}°C</p>
            <p>${desc}</p>
        `;

        forecastDiv.appendChild(forecastItem);
    });
}


function addFavorite() {
    const cityName = document.getElementById('city-name').textContent;
    if (!cityName) return;

    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    if (!favorites.includes(cityName)) {
        favorites.push(cityName);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    } else {
        alert("City already in favorites!");
    }
}


function displayFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favoriteList.innerHTML = "";

    favorites.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        
        const removeBtn = document.createElement('button');
        removeBtn.textContent = "❌";
        removeBtn.onclick = () => removeFavorite(city);
        
        li.appendChild(removeBtn);
        favoriteList.appendChild(li);
    });

    favoritesDiv.classList.toggle('hidden', favorites.length === 0);
}


function removeFavorite(city) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(item => item !== city);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
}


function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
}


window.addEventListener('load', displayFavorites);
