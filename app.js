var express = require('express'),
    app = express(),
    cons = require('consolidate');

app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + '/');
app.use(express.static(__dirname + '/'));

    app.get('/', function(req, res){
            return res.render('index');
    });

    app.listen(process.env.PORT || 8080);
    console.log('Express server started on port 8080');
