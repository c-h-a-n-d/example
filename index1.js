const cityInput = document.querySelector(".input");
const searchButton = document.querySelector(".search");
const useLocationButton = document.getElementById("use-location-button");
const weatherCardsDiv = document.querySelector(".Weather-Cards");
const currentLocationInfo = document.getElementById("current-location-info");
const currentLocationNameDiv = document.getElementById("current-location-name");
const locationInfo = document.getElementById("location-info");

const API_KEY = "ddb6e1a57f9ddd124cdd8653fcd7930b";

const createWeatherCard = (weatherItem, cityName) => `
<li class="cards">
  <h2>${cityName}</h2>
  <h3>${weatherItem[0].dt_txt.split(" ")[0]}</h3>
  <img src="https://openweathermap.org/img/wn/${weatherItem[0].weather[0].icon}.png" alt="weather-icon">
  <h4>Temp: ${(weatherItem.reduce((sum, item) => sum + item.main.temp, 0) / weatherItem.length - 273.15).toFixed(2)}°C</h4>
  <h4>Wind: ${weatherItem[0].wind.speed} M/S</h4>
  <h4>Humidity: ${weatherItem[0].main.humidity}%</h4>
</li>`;

const getWeatherDetails = (cityName, lat, lon) => {
  const weather_Api_Url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  fetch(weather_Api_Url)
    .then(res => res.json())
    .then(data => {
      const dailyForecasts = {};

      data.list.forEach(weatherItem => {
        const date = weatherItem.dt_txt.split(" ")[0];
        if (!dailyForecasts[date]) {
          dailyForecasts[date] = [];
        }
        dailyForecasts[date].push(weatherItem);
      });

      cityInput.value = "";
      weatherCardsDiv.innerHTML = "";

      for (const date in dailyForecasts) {
        const weatherCard = createWeatherCard(dailyForecasts[date], cityName);
        weatherCardsDiv.insertAdjacentHTML("beforeend", weatherCard);
      }
    })
    .catch(error => {
      console.error("An error occurred while fetching weather details:", error);
    });
};

const getCityCoordinates = (cityName) => {
  const GEOCODING_API_url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`;

  fetch(GEOCODING_API_url)
    .then(res => res.json())
    .then(data => {
      if (data.cod === '404') {
        alert(`Coordinates are not found for ${cityName}`);
      } else {
        const coordinates = data.coord;

        getWeatherDetails(cityName, coordinates.lat, coordinates.lon);
      }
    })
    .catch(error => {
      console.error("An error occurred while fetching the coordinates:", error);
    });
};

useLocationButton.addEventListener("click", () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
          .then(res => res.json())
          .then(data => {
            const locationName = data.name;
            const country = data.sys.country;
            const placeInfo = `${locationName}, ${country}`;

            currentLocationInfo.textContent = `Current Location: ${placeInfo}`;
            currentLocationNameDiv.textContent = locationName;
            locationInfo.textContent = `Location: ${placeInfo}`;
            
            getWeatherDetails(placeInfo, lat, lon);
          })
          .catch(error => {
            console.error("An error occurred while fetching location:", error);
          });
      },
      error => {
        console.error("Error getting current location:", error);
        alert("Could not retrieve your current location.");
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});

searchButton.addEventListener("click", () => {
  const cityName = cityInput.value.trim();
  if (!cityName) return;

  getCityCoordinates(cityName);
  locationInfo.textContent = `Location: ${cityName}`;
});

cityInput.addEventListener("keypress", event => {
  if (event.key === "Enter") {
    const cityName = cityInput.value.trim();
    if (!cityName) return;

    getCityCoordinates(cityName);
    locationInfo.textContent = `Location: ${cityName}`;
  }
});
