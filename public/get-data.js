"use strict";
window.onload = () => {
    document.getElementById('results-display').value = '';
    document.getElementById('start-date').valueAsDate = new Date();
    document.getElementById('end-date').valueAsDate = new Date();
};
const form = document.getElementById('search-form');
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const station = document.getElementById('station').value;
    const resultsDisplay = document.getElementById('results-display');
    resultsDisplay.value = '';
    const queryParams = new URLSearchParams({
        "TYPE": "sflist",
        "DATE": endDate,
        "HOUR": "23",
        "STATION": station.toUpperCase()
    });
    fetch(`/getdata?${queryParams.toString()}`)
        .then(response => response.text())
        .then(data => {
        const cleanedData = removeHeader(data);
        displayData(data);
    })
        .catch(error => {
        console.error('Error fetching weather data: ', error);
        document.getElementById('results-display').value = 'Failed to load data.';
    });
});
function getDataHeader(data) {
    let contentArray = data.split('\n');
    contentArray = contentArray.slice(findStartOfData(contentArray) - 2, findStartOfData(contentArray) + 1);
    return contentArray;
}
function removeHeader(data) {
    let contentArray = data.split('\n');
    contentArray = contentArray.slice(findStartOfData(contentArray) + 1, contentArray.length - 2);
    return contentArray;
}
function findStartOfData(data) {
    let index = -1;
    index = data.findIndex((element) => {
        return element.includes("<PRE>");
    });
    return index + 3;
}
function displayData(data) {
    const resultsDisplay = document.getElementById('results-display');
    let headerArray = getDataHeader(data);
    let dataArray = removeHeader(data);
    for (let line of headerArray) {
        resultsDisplay.value += line + '\n';
    }
    for (let line of dataArray) {
        resultsDisplay.value += line + '\n';
    }
}
