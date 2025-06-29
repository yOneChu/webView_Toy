

cosnt = items = ['aa', 'bb', 'banana', 'bb', 'bb'];

console.log(items);

items[10] = 'zz';
console.log(items);

const modItem = items.filter((dt) => dt !== 'bb');

console.log(modItem);
