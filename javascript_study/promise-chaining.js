fetch('https://jsonplaceholder.typicode.com/todos?_limit=5')
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log('data: ', data);
    })
    .catch(error => {
        console.log('err: ', error.message);
    })
