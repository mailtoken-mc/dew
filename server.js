const express = require('express');
const app = express();
app.use(express.static(__dirname + '/dist'));
app.set('view engine', 'pug');
app.get('/', (req, res) => {
    res.render('index')
});

const server = app.listen(8080, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});