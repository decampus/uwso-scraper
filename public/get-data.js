import dayjs from 'dayjs';
window.onload = () => {
    document.getElementById('results-display').value = '';
    document.getElementById('start-date').valueAsDate = new Date();
    document.getElementById('end-date').valueAsDate = new Date();
};
const form = document.getElementById('search-form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const station = document.getElementById('station').value;
    const resultsDisplay = document.getElementById('results-display');
    let duration = calculateTotalDaysBetweenDates(startDate, endDate);
    resultsDisplay.value = '';
    if (duration > 1) {
        getDataForDays(duration, startDate, station);
    }
    else {
        let rawData = await getData(endDate, station);
        let header = getDataHeader(rawData);
        let data = get24HoursRows(rawData);
        displayData(header, data);
    }
});
function getDataHeader(data) {
    let contentArray = data.split('\n');
    contentArray = contentArray.slice(findStartOfData(contentArray) - 2, findStartOfData(contentArray) + 1);
    return contentArray;
}
function get24HoursRows(data) {
    let slicedData = removeHeader(data).slice(0, 24);
    return slicedData;
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
function calculateTotalDaysBetweenDates(startDate, endDate) {
    let date1 = dayjs(startDate);
    let date2 = dayjs(endDate);
    return date2.diff(date1, 'day') + 1;
}
async function fetchData(queryParams) {
    try {
        const response = await fetch(`/getdata?${queryParams.toString()}`);
        if (!response.ok) {
            throw new Error(`HTTP error status: ${response.status}`);
        }
        const data = await response.text();
        return data;
    }
    catch (error) {
        console.log('Error fetching weather data: ', error);
        return 'Failed to load data.';
    }
}
function getDataForDays(duration, startDate, station) {
}
async function getData(date, station) {
    const queryParams = new URLSearchParams({
        "TYPE": "sflist",
        "DATE": date,
        "HOUR": "23",
        "STATION": station.toUpperCase()
    });
    try {
        const result = await fetchData(queryParams);
        return result || 'No data received.';
    }
    catch (error) {
        console.error('Error: ', error);
        return 'An unexpected error occurred.';
    }
}
function displayData(header, data) {
    const resultsDisplay = document.getElementById('results-display');
    for (let line of header) {
        resultsDisplay.value += line + '\n';
    }
    for (let line of data) {
        resultsDisplay.value += line + '\n';
    }
}
