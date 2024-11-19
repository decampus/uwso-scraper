"use strict";
const form = document.getElementById('search-form');
form.addEventListener('submit', (event) => {
    event.preventDefault();
    fetch('/getdata')
        .then(response => response.text())
        .then(data => {
        document.getElementById('results-display').value = data;
    })
        .catch(error => {
        console.error('Error fetching weather data: ', error);
        document.getElementById('results-display').value = 'Failed to load data.';
    });
});
