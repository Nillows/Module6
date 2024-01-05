// When the document is fully loaded, I want to execute this function.
document.addEventListener('DOMContentLoaded', function() {
  // I want to load and display the search history as soon as the page loads.
  updateSearchHistory();

  // I'm initially hiding the weather-display div because I want it to be shown only after a city's weather data is fetched.
  const weatherDisplay = document.querySelector('.weather-display');
  weatherDisplay.style.display = 'none';
  
  // I'm setting up an event listener for when the user clicks the search button.
  document.getElementById('search-button').addEventListener('click', function() {
    // Here I'm capturing the city name entered by the user and trimming any extra whitespace.
    var cityName = document.getElementById('city-search').value.trim();
    if (cityName) {
      // If a city name is entered, I want to fetch its weather data, add it to the search history, and show the weather-display div.
      getWeatherData(cityName);
      addCityToSearchHistory(cityName); 
      weatherDisplay.style.display = ''; 
    }
  });

  // I'm setting up event delegation for clicks on the search history buttons (excluding the clear history button).
  document.querySelector('.search-history').addEventListener('click', function(event) {
    if (event.target && event.target.nodeName === 'BUTTON' && event.target.id !== 'clear-history') {
      // When a history button is clicked, I want to fetch and display the weather for that city.
      getWeatherData(event.target.textContent);
      weatherDisplay.style.display = ''; 
    }
  });
});

// I want this function to fetch and display the current weather data for a specified city.
function getWeatherData(city) {
    fetch('https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=6cc76ded82b05eb3b4ed7214ce00ffd9&units=imperial')
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('City not found!');
        }
      })
      .then(data => {
        // Here I update the UI with the current weather and fetch the 5-day forecast.
        updateCurrentWeather(data);
        getForecast(data.coord.lat, data.coord.lon);
      })
      .catch(error => {
        console.error('Error:', error);
        alert(error.message);
      });
}

// I want this function to fetch and display the 5-day forecast data for the given coordinates.
function getForecast(lat, lon) {
    fetch('https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&appid=6cc76ded82b05eb3b4ed7214ce00ffd9&units=imperial')
      .then(response => response.json())
      .then(data => {
        // Here I update the UI with the forecast data.
        updateForecast(data);
      })
      .catch(error => {
        console.error('Error fetching forecast data:', error);
        alert('Error fetching forecast data. Please try again later.');
      });
}

// I want this function to update the current weather section of the UI with the provided data.
function updateCurrentWeather(data) {
    const cityNameElement = document.getElementById('city-name');
    // Here I'm setting the text content for the city name and the current date.
    cityNameElement.textContent = `${data.name} (${new Date().toLocaleDateString()})`;
    // I want to append the weather icon for the current weather next to the city name.
    cityNameElement.innerHTML += getWeatherIcon(data.weather[0].icon);

    // I'm setting the text content for temperature, wind speed, and humidity.
    document.getElementById('current-temp').textContent = `${data.main.temp.toFixed(1)}°F`;
    document.getElementById('current-wind').textContent = `${data.wind.speed.toFixed(1)} MPH`;
    document.getElementById('current-humidity').textContent = `${data.main.humidity}%`;

    // Here I wanted to clear any previous icon and set up a new one.
    const iconContainer = document.getElementById('icon-container');
    iconContainer.innerHTML = getWeatherIcon(data.weather[0].icon);
    const icon = iconContainer.firstChild;
    icon.id = "pizazz"; // I'm setting the ID for the icon to apply specific styles.

    // I want to reset the animation if it's already running to prevent multiple animations from overlapping.
    if (window.weatherIconTimer) {
        clearInterval(window.weatherIconTimer);
        icon.style.left = '0px'; // I'm resetting the position of the icon.
    }

    // I'm determining the speed of the animation based on wind speed.
    const windSpeed = data.wind.speed; // I'm getting the wind speed from the data.
    const animationSpeed = Math.max(10, windSpeed * 3); // I'm calculating the animation speed and ensuring it's not too slow.

    // Here's the animation logic where I want the icon to move smoothly to the right.
    var i = 0;
    window.weatherIconTimer = setInterval(() => {
        icon.style.left = i + 'px';
        i = i + 1;
        if (i > iconContainer.offsetWidth) { // I'm checking if the icon has moved beyond the container's width.
            i = -icon.offsetWidth; // I'm resetting the icon to just before the start for a looping effect.
        }
    }, 50 - Math.min(40, animationSpeed)); // I'm adjusting the interval based on the animation speed.
}

// I want this function to update the forecast section of the UI with the 5-day forecast data.
function updateForecast(data) {
    // I want to show the weather-display div when updating the forecast.
    document.querySelector('.weather-display').style.display = '';

    // I'm clearing any previous forecast data.
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';
  
    // I'm processing and inserting forecast data for the next 5 days.
    for (let i = 0; i < data.list.length; i += 8) { // Assuming data every 3 hours, I'm taking one data point per day.
      const forecastData = data.list[i];
      const forecastElem = document.createElement('div');
      forecastElem.className = 'forecast-card';
      // Here I'm setting the inner HTML for each forecast card.
      forecastElem.innerHTML = `
        <p>${new Date(forecastData.dt_txt).toLocaleDateString()}</p>
        <p>${getWeatherIcon(forecastData.weather[0].icon)}</p>
        <p>Temp: ${forecastData.main.temp.toFixed(1)} °F</p>
        <p>Wind: ${forecastData.wind.speed.toFixed(1)} MPH</p>
        <p>Humidity: ${forecastData.main.humidity}%</p>
      `;
      forecastContainer.appendChild(forecastElem); // I'm appending the forecast card to the container.
    }
}

// I want this function to return the corresponding weather icon image element for a given icon code.
function getWeatherIcon(iconCode) {
    const iconUrl = `http://openweathermap.org/img/w/${iconCode}.png`;
    return `<img src="${iconUrl}" alt="Weather icon">`;
}

// I want this function to add a searched city to the search history in local storage and update the display.
function addCityToSearchHistory(city) {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!searchHistory.includes(city)) {
        searchHistory.unshift(city); // I'm adding the new city to the start of the array.
        searchHistory = searchHistory.slice(0, 10); // I'm keeping only the latest 10 entries.
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory)); // I'm saving the updated array back to local storage.
    }
    updateSearchHistory(); // I'm updating the search history display.
}

// I want this function to update the search history section of the UI with the stored search history.
function updateSearchHistory() {
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    const searchHistoryContainer = document.querySelector('.search-history');
    searchHistoryContainer.innerHTML = '<h3>Search History:</h3>'; // I'm setting the title for the search history section.

    // I'm creating and appending a button for each city in the history.
    searchHistory.forEach(function(city) {
        const cityButton = document.createElement('button');
        cityButton.textContent = city;
        cityButton.className = 'history-button';
        searchHistoryContainer.appendChild(cityButton);
    });

    // I'm adding a Clear History button if there is any history.
    if (searchHistory.length > 0) {
        const clearButton = document.createElement('button');
        clearButton.textContent = 'Clear History';
        clearButton.id = 'clear-history';
        clearButton.addEventListener('click', function() {
            localStorage.clear(); // Here I'm clearing the local storage.
            updateSearchHistory(); // I'm updating the search history display.
        });
        searchHistoryContainer.appendChild(clearButton); // I'm appending the clear button to the search history container.
    }
}
