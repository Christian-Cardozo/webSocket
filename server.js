const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require('fs').promises

const handlebars = require('express-handlebars');
const got = require('got');
const port = 3000;

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
app.use(express.static(__dirname + '/assets/'));

app.set('view engine', 'hbs');

app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs',
    partialsDir: __dirname + '/views/partials/'
}));

let productos = []
let mensajes = []

async function writeFile (){
    try{
        const file = "messages.json"
        await fs.writeFile(file, JSON.stringify(mensajes))
    }   
    catch(error){
        console.log(error);
    }    
}

async function readFile (){
    try{
        const file = 'messages.json'
        const data = await fs.readFile(file)
        return JSON.parse(data)
    }   
    catch(error){
        console.log("ReadFile error: " + error);
    }    
}

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    
    socket.on('new-product', async (data) =>{
        
        console.log(data)

        const { body } = await got.post('http://127.0.0.1:8080/api/productos', {
            json: data, 
            responseType: 'json'
        })

        data.id = Math.max.apply(Math, productos.map(item => { return item.id; })) + 1

        productos.push(data);
        io.sockets.emit('products', productos)
    })

    socket.on('new-message', async (data) =>{
                
        mensajes.push(data);
        await writeFile()
        io.sockets.emit('messages', mensajes)
    })
});

app.get('/', (req, res) => {    
    res.render('main', { layout: 'index' });
});

app.get('/productos', async (req, res) => {

    try {
        const { body } = await got.get('http://127.0.0.1:8080/api/productos');
        productos = JSON.parse(body);
        
        mensajes = await readFile()
                 
        
        console.log(mensajes);
        res.render('products', { layout: 'index', products: productos, messages: mensajes, listExists: body, messageExists: mensajes.length>0});
    }
    catch (error) {
        res.render('error', { layout: 'index', error })
    }
});

app.get('/error', (req, res) => {
    res.render('error', { layout: 'index' });
});

app.post('/productos', async (req, res) => {

    try {

        const { body } = await got.post('http://127.0.0.1:8080/api/productos', {
            json: req.body,
            responseType: 'json'
        })

        console.log(body)

        res.redirect('/productos')
    }
    catch (error) {
        res.render('error', { layout: 'index', error })
    }
});

server.listen(port, () => console.log(`WebServer ejecutandose en el puerto ${port}`));