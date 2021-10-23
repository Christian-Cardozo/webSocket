const express = require('express');
const app = express();
const port = 3000;

var got = require('got');
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));

//Loads the handlebars module
const handlebars = require('express-handlebars');

//Sets our app to use the handlebars engine
app.set('view engine', 'hbs');

//Sets handlebars configurations (we will go through them later on)
app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs',
    partialsDir: __dirname + '/views/partials/'
}));

app.use(express.static('public'))
app.use(express.static(__dirname + '/assets/'));

app.get('/', (req, res) => {
    //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
    res.render('main', { layout: 'index' });
});

app.get('/productos', async (req, res) => {

    try {
        const { body } = await got.get('http://127.0.0.1:8080/api/productos')

        //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
        res.render('products', { layout: 'index', products: JSON.parse(body), listExists: body });
    }
    catch (error) {
        res.render('error', { layout: 'index', error })
    }
});

app.get('/producto/nuevo', async (req, res) => {

    //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
    res.render('newProduct', { layout: 'index' });
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

app.listen(port, () => console.log(`WebServer ejecutandose en el puerto ${port}`));