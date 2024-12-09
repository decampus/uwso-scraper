window.onload = () => {
    (document.getElementById('results-display') as HTMLTextAreaElement).value = '';
    (document.getElementById('date') as HTMLInputElement).valueAsDate = new Date();
}

const form = document.getElementById('search-form') as HTMLFormElement;

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const date = (document.getElementById('date') as HTMLInputElement).value;
    const station = (document.getElementById('station') as HTMLInputElement).value;
    const resultsDsiplay = (document.getElementById('results-display') as HTMLTextAreaElement);

    resultsDsiplay.value = '';

    const queryParams = new URLSearchParams({
        "TYPE": "sflist", // Make it to be dynamic, maybe. UNITS as well.
        "DATE": date,
        "HOUR": "23", // Since it gets the info for the whole day, I guess.
        "STATION": station.toUpperCase()
    })

    fetch(`/getdata?${queryParams.toString()}`)
    .then(response => response.text())
    .then(data => {
        const cleanedData = removeHeader(data);
        displayData(data);
    })
    .catch(error => {
        console.error('Error fetching weather data: ', error);
        (document.getElementById('results-display') as HTMLTextAreaElement).value = 'Failed to load data.';
    })
})

function getDataHeader(data: string) {
    let contentArray = data.split('\n');

    contentArray = contentArray.slice(findStartOfData(contentArray) - 2, findStartOfData(contentArray) + 1);

    return contentArray;
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

function displayData(data: string) {
    const resultsDisplay = (document.getElementById('results-display') as HTMLTextAreaElement);
    let headerArray = getDataHeader(data);
    let dataArray = removeHeader(data);

    for (let line of headerArray) {
        resultsDisplay.value += line + '\n';
    }

    for (let line of dataArray) {
        resultsDisplay.value += line + '\n';
    }
}