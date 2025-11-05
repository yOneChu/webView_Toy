
const todoList = document.querySelector('#todo-list');
const todoInput = document.querySelector('#todo-input');

const createTodo = function() {
    console.log('--- createTodo ---');
    let inputValue = document.querySelector('#todo-input').value;
    const newLi = document.createElement('li');
    const newSpan = document.createElement('span');
    const newBtn = document.createElement('button');

    newBtn.addEventListener('click', () => {
        newLi.classList.toggle('complete');
    })

    // 더블클릭
    newLi.addEventListener('dblclick', () => {
        newLi.remove();
    })


    newSpan.textContent = inputValue;
    newLi.appendChild(newBtn);
    newLi.appendChild(newSpan);
    todoList.appendChild(newLi);
    //console.log(newLi);
    todoInput.value = '';
    console.log(todoList);
    //console.log(todoList.children[0].querySelector('span').textContent);
    saveItems()
}


const keyCodeCheck = function() {
    if (window.event.keyCode === 13) {
        createTodo();
    }
}


const deleteAll = function() {
    const  liList = document.querySelectorAll('li');
    for( let i = 0; i < liList.length; i++ ) {
        liList[i].remove();
    }
}

const saveItems = function() {
    const saveItems = [];
    console.log(todoList.children[0].querySelector('span').textContent);
    for (let i = 0; i < todoList.children.length; i++) {
        //const todo = todoList.children[i].querySelector('span').textContent;
        const todoObj = {
            contents : todoList.children[i].querySelector('span').textContent,
            complete : todoList.children[i].classList.contains('complete')
        }
        saveItems.push(todoObj);
    }
    console.log(saveItems);

}

