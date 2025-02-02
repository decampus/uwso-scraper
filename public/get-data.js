import dayjs from 'dayjs';
window.onload = () => {
    document.getElementById('results-display').value = '';
    document.getElementById('start-date').valueAsDate = new Date('2025-01-15T00:00:00');
    document.getElementById('end-date').valueAsDate = new Date('2025-01-19T00:00:00');
};
const form = document.getElementById('search-form');
const fullHeader = [
    "STN     TIME ALTM   TMP DEW RH  DIR SPD VIS  CLOUDS                  Weather     ",
    "     DD/HHMM hPa    C   C   %   deg m/s km                                       ",
    "==== ======= ====== === === === === === ==== ======= ======= ======= ============"
];
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const station = document.getElementById('station').value;
    const resultsDisplay = document.getElementById('results-display');
    let duration = calculateTotalDaysBetweenDates(startDate, endDate);
    resultsDisplay.value = '';
    if (duration >= 1) {
        loadingButton();
        let data = await getDataForDays(duration, startDate, station);
        loadingButtonDismiss();
        displayData(fullHeader, data);
    }
    else {
        loadingButton();
        let data = await getData(endDate, station);
        loadingButtonDismiss();
        displayData(fullHeader, data);
    }
});
function removeHeader(data) {
    let contentArray = data.split('\n');
    contentArray = contentArray.slice(findStartOfData(contentArray) + 1, contentArray.length - 2);
    return contentArray.slice(0, 24);
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
    return date2.diff(date1, 'day');
}
async function fetchData(queryParams) {
    try {
        const response = await fetch(`/getdata?${queryParams.toString()}`);
        if (!response.ok) {
            throw new Error(`HTTP error status: ${response.status}`);
        }
        return await response.text();
    }
    catch (error) {
        console.log('Error fetching weather data: ', error);
        return 'Failed to load data.';
    }
}
async function getDataForDays(duration, startDate, station) {
    let data = await getData(startDate, station);
    let final = data.slice(0, 24);
    let date = dayjs(startDate);
    let previousDay = new Set();
    let currentDay = new Set();
    for (let line of data) {
        previousDay.add(line);
    }
    for (let i = 0; i < duration; i++) {
        date = date.add(1, 'day');
        let newData = await getData(date.toISOString().split('T')[0], station);
        for (let line of newData) {
            currentDay.add(line);
        }
        let sameDayValues = setDifference(previousDay, currentDay);
        previousDay.clear();
        currentDay.forEach((day) => {
            previousDay.add(day);
        });
        currentDay.clear();
        final = final.concat([...sameDayValues]);
    }
    return final;
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
        let data = removeHeader(result);
        return data || 'No data received.';
    }
    catch (error) {
        console.error('Error: ', error);
        return ['An unexpected error occurred.'];
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
function loadingButton() {
    const button = document.getElementById('submit-button');
    button.ariaBusy = 'true';
    button.textContent = 'Wait...';
}
function loadingButtonDismiss() {
    const button = document.getElementById('submit-button');
    button.ariaBusy = 'false';
    button.textContent = 'Get results';
}
function setDifference(setA, setB) {
    const result = new Set();
    setB.forEach(value => {
        if (!setA.has(value)) {
            result.add(value);
        }
    });
    return result;
}
