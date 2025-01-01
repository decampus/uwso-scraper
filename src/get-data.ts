import dayjs from 'dayjs';

window.onload = () => {
    (document.getElementById('results-display') as HTMLTextAreaElement).value = '';
    (document.getElementById('start-date') as HTMLInputElement).valueAsDate = new Date();
    (document.getElementById('end-date') as HTMLInputElement).valueAsDate = new Date();
}

const form = document.getElementById('search-form') as HTMLFormElement;

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const startDate = (document.getElementById('start-date') as HTMLInputElement).value;
    const endDate = (document.getElementById('end-date') as HTMLInputElement).value;
    const station = (document.getElementById('station') as HTMLInputElement).value;
    const resultsDisplay = (document.getElementById('results-display') as HTMLTextAreaElement);

    let duration = calculateTotalDaysBetweenDates(startDate, endDate);

    resultsDisplay.value = '';

    if (duration > 1) {
        getDataForDays(duration, startDate, station);
    } else {
        let rawData = await getData(endDate, station);
        let header = getDataHeader(rawData);
        let data = get24HoursRows(rawData);
        
        displayData(header, data);
    }
})

function getDataHeader(data: string) {
    let contentArray = data.split('\n');

    contentArray = contentArray.slice(findStartOfData(contentArray) - 2, findStartOfData(contentArray) + 1);

    return contentArray;
}

function get24HoursRows(data: string) {
    let slicedData = removeHeader(data).slice(0, 24);

    return slicedData;
}

function removeHeader(data: string) {
    let contentArray = data.split('\n');

    contentArray = contentArray.slice(findStartOfData(contentArray) + 1, contentArray.length - 2);

    return contentArray;
}

function findStartOfData(data: string[]) {
    let index = -1;

    index = data.findIndex((element) => {
        return element.includes("<PRE>");
    })

    return index + 3;
}

function calculateTotalDaysBetweenDates(startDate: string, endDate: string) {
    let date1 = dayjs(startDate);
    let date2 = dayjs(endDate);

    return date2.diff(date1, 'day') + 1;
}

async function fetchData(queryParams: URLSearchParams) {
    try {
        const response = await fetch(`/getdata?${queryParams.toString()}`)

        if (!response.ok) {
            throw new Error(`HTTP error status: ${response.status}`);
        }

        const data = await response.text();

        return data;
    } catch (error) {
        console.log('Error fetching weather data: ', error);
        return 'Failed to load data.';
    }
}

function getDataForDays(duration: number, startDate: string, station: string) {
    
}

async function getData(date: string, station: string) {
    const queryParams = new URLSearchParams({
        "TYPE": "sflist", // Make it to be dynamic, maybe. UNITS as well.
        "DATE": date,
        "HOUR": "23", // Since it gets the info for the whole day, I guess.
        "STATION": station.toUpperCase()
    })
    
    try {
        const result = await fetchData(queryParams);

        return result || 'No data received.';
    } catch (error) {
        console.error('Error: ', error);
        return 'An unexpected error occurred.';
    }
}

function displayData(header: string[], data: string[]) {
    const resultsDisplay = (document.getElementById('results-display') as HTMLTextAreaElement);

    for (let line of header) {
        resultsDisplay.value += line + '\n';
    }

    for (let line of data) {
        resultsDisplay.value += line + '\n';
    }
}