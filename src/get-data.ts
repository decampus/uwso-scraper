import dayjs from 'dayjs';

window.onload = () => {
    (document.getElementById('results-display') as HTMLTextAreaElement).value = '';
    (document.getElementById('start-date') as HTMLInputElement).valueAsDate = new Date();
    (document.getElementById('end-date') as HTMLInputElement).valueAsDate = new Date();
}

const form = document.getElementById('search-form') as HTMLFormElement;
const fullHeader = [
    "STN     TIME ALTM   TMP DEW RH  DIR SPD VIS  CLOUDS                  Weather     ",
    "     DD/HHMM hPa    C   C   %   deg m/s km                                       ",
    "==== ======= ====== === === === === === ==== ======= ======= ======= ============"
]

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const startDate = (document.getElementById('start-date') as HTMLInputElement).value;
    const endDate = (document.getElementById('end-date') as HTMLInputElement).value;
    const station = (document.getElementById('station') as HTMLInputElement).value;
    const resultsDisplay = (document.getElementById('results-display') as HTMLTextAreaElement);

    let duration = calculateTotalDaysBetweenDates(startDate, endDate);

    resultsDisplay.value = '';

    if (duration >= 1) {
        loadingButton();
        let data = await getDataForDays(duration, startDate, station);
        loadingButtonDismiss();

        displayData(fullHeader, data);
    } else {
        loadingButton();
        let data = await getData(endDate, station);
        loadingButtonDismiss();

        displayData(fullHeader, data);
    }
})

function removeHeader(data: string) {
    let contentArray = data.split('\n');

    contentArray = contentArray.slice(findStartOfData(contentArray) + 1, contentArray.length - 2);

    return contentArray.slice(0, 24);
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

    return date2.diff(date1, 'day');
}

async function fetchData(queryParams: URLSearchParams) {
    try {
        const response = await fetch(`/getdata?${queryParams.toString()}`)

        if (!response.ok) {
            throw new Error(`HTTP error status: ${response.status}`);
        }

        return await response.text();
    } catch (error) {
        console.log('Error fetching weather data: ', error);
        return 'Failed to load data.';
    }
}

async function getDataForDays(duration: number, startDate: string, station: string) {
    let data = await getData(startDate, station);
    let final:string[] = data.slice(0, 24);

    let date = dayjs(startDate);
    let previousDay = new Set<string>();
    let currentDay = new Set<string>();

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
        })

        currentDay.clear();

        final = final.concat([...sameDayValues]);
    }

    // console.log('Previous day:', previousDay);
    // console.log('Current day: ', currentDay);

    return final;
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
        // let data = result.split('\n');
        let data = removeHeader(result);

        return data || 'No data received.';
    } catch (error) {
        console.error('Error: ', error);
        return ['An unexpected error occurred.'];
    }
}

function displayData(header: string[], data: string[] | string) {
    const resultsDisplay = (document.getElementById('results-display') as HTMLTextAreaElement);

    for (let line of header) {
        resultsDisplay.value += line + '\n';
    }

    for (let line of data) {
        resultsDisplay.value += line + '\n';
    }
}

function loadingButton() {
    const button = document.getElementById('submit-button') as HTMLButtonElement;

    button.ariaBusy = 'true';
    button.textContent = 'Wait...';
}

function loadingButtonDismiss() {
    const button = document.getElementById('submit-button') as HTMLButtonElement;

    button.ariaBusy = 'false';
    button.textContent = 'Get results';
}

function setDifference(setA: Set<any>, setB: Set<any>):Set<any> {
    const result = new Set<any>();

    setB.forEach(value => {
        if (!setA.has(value)) {
            result.add(value);
        }
    });

    return result;
}