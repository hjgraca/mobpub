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

    // app.get('*', function(req, res){
    //     console.log(req.params[0]);
    //     return res.render(req.params[0]);
    // });

    app.listen(8080);
    console.log('Express server started on port 8080');
