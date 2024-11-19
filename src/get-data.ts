const form = document.getElementById('search-form') as HTMLFormElement;

form.addEventListener('submit', (event) => {
    event.preventDefault();

    fetch('/getdata')
    .then(response => response.text())
    .then(data => {
        (document.getElementById('results-display') as HTMLTextAreaElement).value = data;
    })
    .catch(error => {
        console.error('Error fetching weather data: ', error);
        (document.getElementById('results-display') as HTMLTextAreaElement).value = 'Failed to load data.';
    })
})