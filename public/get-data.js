"use strict";
const form = document.getElementById('search-form');
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const date = document.getElementById('date').value;
    const station = document.getElementById('station').value;
    const queryParams = new URLSearchParams({
        "TYPE": "sflist",
        "DATE": date,
        "HOUR": "23",
        "STATION": station.toUpperCase()
    });
    fetch(`/getdata?${queryParams.toString()}`)
        .then(response => response.text())
        .then(data => {
        document.getElementById('results-display').value = data;
    })
        .catch(error => {
        console.error('Error fetching weather data: ', error);
        document.getElementById('results-display').value = 'Failed to load data.';
    });
});
