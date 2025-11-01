const keyCodeCheck = function() {
    //console.log(window.event)

    if (window.event.keyCode === 13) {
        const inputValue = document.querySelector('#todo-input');
        console.log(inputValue);

        const hiTag = document.querySelector('#hiTag');
        hiTag.textContent = 'test Val';
    }
}



