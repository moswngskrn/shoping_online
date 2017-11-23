const functions = require('firebase-functions');
const firebase = require('firebase-admin')
const express = require('express');
const engines = require('consolidate');

const firebaseApp = firebase.initializeApp(
    functions.config().firebase
);

function getProduct(){
    const ref = firebaseApp.database().ref('Product');
    return ref.once('value').then(snap=>snap.val());
}

function getProductById(id){
    const ref = firebaseApp.database().ref('Product/'+id);
    return ref.once('value').then(snap=>snap.val());
}

const app = express();
app.engine('hbs',engines.handlebars);
app.set('views','./views');
app.set('view engine','hbs');

app.get('/',(request,response)=>{
    response.set('Cache-Control','public, max-age=300, s-maxage=600');
    getProduct().then(product=>{
        response.render('index',{ product });
    });
});

app.get('/product-detail/:nameproduct',(request,response)=>{
    var name = request.param('nameproduct');
    response.set('Cache-Control','public, max-age=300, s-maxage=600');
    getProductById(name.toString()).then(product=>{
        if(!product){
            response.send('Don\'t have "'+name+'"');
            return;
        }
        response.render('view-product',{ product,name });
    });
});


app.get('/getproduct.json',(request,response)=>{
    response.set('Cache-Control','public, max-age=300, s-maxage=600');
    getProduct().then(product=>{
        response.json(product)
    });
});

exports.app = functions.https.onRequest(app);
