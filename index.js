const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()

const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());


app.get('/', (req, res) => {
res.send('Hello World!')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.je9oc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log('connection err', err)
    const productCollection = client.db("shoilan").collection("products");
    const orderCollection = client.db("shoilan").collection("orders");
  
    app.get('/products', (req, res) => {
        productCollection.find()
        .toArray((err, items) => {
            res.send(items)
        })
    })

    app.get('/products/:id', (req, res) => {
        productCollection.find({ _id: ObjectID(`${req.params.id}`) })
        .toArray((err, items) => {
            console.log(items);
            res.send(items[0])
        })
    })

    app.post('/addProduct', (req, res) => {
        const newProduct = req.body;
        console.log('adding new product: ', newProduct)
        productCollection.insertOne(newProduct)
        .then(result => {
            console.log('inserted count', result.insertedCount, result);
            res.send(result.insertedCount > 0)
        })
    })

    app.delete('/deleteProduct/:id', (req, res) => {
        // console.log('delete this', id);
        const id = ObjectID(req.params.id);
        productCollection.findOneAndDelete({ _id: id })
        .then(documents =>{
            console.log(!!documents);
            res.send(!!documents.value)
        } )
    })

    app.get('/orders/:email', (req, res) => {
        console.log(req.params.email);
        orderCollection.find({ userEmail: `${req.params.email}` })
        .toArray((err, items) => {
            res.send(items)
        })
    })
    
    app.post('/addOrder', (req, res) => {
        const newOrder = req.body;
        console.log('adding new order: ', newOrder)
        orderCollection.insertOne(newOrder)
        .then(result => {
            console.log('inserted count', result.insertedCount, result);
            res.send(result.insertedCount > 0)
        })
    })

//   client.close();
});



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})