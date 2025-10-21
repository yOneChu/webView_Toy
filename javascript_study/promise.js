
const myPromise = new Promise((resolve, reject) => {

    setTimeout(() => {
        const text = prompt('Please enter your workspace...');
        if (text === 'hello') {
            resolve("노트북!!!!!!!");
        } else {
            reject("fail-..........");
        }
    }, 2000)
});

myPromise
    .then(result => {
    console.log('result: ', result);
    })
.catch(err => {
    console.log('error: ', err);
}).finally(() =>{
    console.log('finally');
})