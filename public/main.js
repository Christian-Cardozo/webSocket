const socket = io();

socket.on('products', data => {
    render(data);
})

socket.on('messages', data => {
    renderMessage(data);
})

function render(data){
    const html = data.map((item, index)=>{

        return(`<tr>
        <th scope="row">${item.id}</th>
        <td>${item.title}</td>
        <td>$${item.price}</td>
        <td><img src=${item.thumbnail} style="height: 50px; width: 50px;"></td>
    </tr>`)
    }).join(" ");

    var tbodyRef = document.getElementById('products').getElementsByTagName('tbody')[0];
    tbodyRef.innerHTML = html;
}

function renderMessage(data){
    const html = data.map((item, index)=>{

        return(`<div>
        <strong style="color:blue">${item.email}</strong>
        <span style="color:brown">[${item.date}]: </span>
        <span style="color:green; font: italic">${item.text}</span>        
    </div>`)
    }).join(" ");

    document.getElementById('mensajes').innerHTML = html;
}

function addProduct(e){
    const product = {
        title: document.getElementById('title').value, 
        price: document.getElementById('price').value, 
        thumbnail: document.getElementById('thumbnail').value, 
    }

    console.log(product)
    socket.emit('new-product', product);
    return false;
}

function addMessage(e){
    const date = new Date(Date.now())
    const message = {
        date: `${date.toLocaleDateString('es-AR')} ${date.toLocaleTimeString('es-AR')}`,
        email: document.getElementById('email').value, 
        text: document.getElementById('message').value, 
    }

    console.log(message)
    socket.emit('new-message', message);
    return false;
}