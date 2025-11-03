
const todoList = document.querySelector('#todo-list');
const todoInput = document.querySelector('#todo-input');

const createTodo = function() {
    let inputValue = document.querySelector('#todo-input').value;
    const newLi = document.createElement('li');
    const newSpan = document.createElement('span');
    const newBtn = document.createElement('button');

    newBtn.addEventListener('click', () => {
        newLi.classList.toggle('complete');
    })


    newSpan.textContent = inputValue;
    newLi.appendChild(newBtn);
    newLi.appendChild(newSpan);
    todoList.appendChild(newLi);
    console.log(newLi);
    todoInput.value = '';
}


const keyCodeCheck = function() {
    if (window.event.keyCode === 13) {
        createTodo();
    }
}



