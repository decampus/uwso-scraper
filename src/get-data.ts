const form = document.getElementById('search-form') as HTMLFormElement;

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const date = (document.getElementById('date') as HTMLInputElement).value;
    const station = (document.getElementById('station') as HTMLInputElement).value;

    const queryParams = new URLSearchParams({
        "TYPE": "sflist", // Make it to be dynamic, maybe. UNITS as well.
        "DATE": date,
        "HOUR": "23", // Since it gets the info for the whole day, I guess.
        "STATION": station.toUpperCase()
    })

    fetch(`/getdata?${queryParams.toString()}`)
    .then(response => response.text())
    .then(data => {
        (document.getElementById('results-display') as HTMLTextAreaElement).value = data;
    })
    .catch(error => {
        console.error('Error fetching weather data: ', error);
        (document.getElementById('results-display') as HTMLTextAreaElement).value = 'Failed to load data.';
    })
})