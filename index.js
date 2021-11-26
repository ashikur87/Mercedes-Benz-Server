const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
const app = express()
const port = 9000
require('dotenv').config()
app.use(cors())    //middleware
app.use(bodyParser.json())  //middleware
//file upload
const fileUpload = require('express-fileupload');
app.use(express.static('doctors'));   
app.use(fileUpload());
const MongoClient = require('mongodb').MongoClient;

const ObjectId = require('mongodb').ObjectId


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8kme4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);


client.connect(err => {
    const serviceCollection = client.db("service").collection("serviceCollection");
    const BookCollection = client.db("service").collection("Book");
    const reviewCollection = client.db("service").collection("review");
    const adminCollection = client.db("service").collection("admin");

    app.get('/extra', (req, res) => {
        console.log(req.body);
        res.send("ok ")
    })

    app.post('/addService', (req, res) => {
        const file = req.files.file 
        const price = req.body.price
        const title = req.body.title
        const description = req.body.description

        console.log(price, title, description, file);



        const filePath = `${__dirname}/doctors/${file.name}`
        file.mv(filePath, (err) => {
            if (err) {
                res.status(500).send({ msg: "failed to upload" });
            }
           
        });

        const newImg = file.data;
       
        const encImg = newImg.toString('base64');
        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ price, title, description, image })
            .then(result => {
                fs.rm(filePath, err => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ msg: "failed to upload" })
                    }
                    res.send(result.insertedCount > 0);



                })
            })
    })

    app.get('/service', (req, res) => {
       
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.delete('/delete/:id', (req, res) => {
        console.log(req.params.id);
        serviceCollection.deleteOne({
            _id: ObjectId(req.params.id)
          
        })
            .then((result) => {
                console.log(result);
                res.send(result.deletedCount > 0)
            })
    })


    app.get('/service/:id', (req, res) => {
        serviceCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, documents) => {
                res.send(documents[0])
            })
    })

    app.post('/addBooking', (req, res) => {    
        const book = req.body
        BookCollection.insertOne(book)
            .then(result => {

           
                console.log(result);
                res.send(result.insertedCount > 0)
            })
    })
    app.get('/getBooking', (req, res) => {
        BookCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })



    app.get('/bookCollection', (req, res) => {
        console.log(req.query.email);
        BookCollection.find({ email: req.query.email })
            .toArray((err, items) => {
                console.log(items)
                res.send(items)
            })

    })

   


    app.post('/addReview', (req, res) => {    //for data create
        const order = req.body
        console.log(order);
        reviewCollection.insertOne(order)
            .then(result => {

               
                console.log(result);
                res.send(result.insertedCount > 0)
            })
    })
    app.get('/addReview', (req, res) => {    //for data create
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })

    })

    //make admin
    app.post('/makeAdmin', (req, res) => {
        const user = req.body;
        console.log(user);
        adminCollection.insertOne(user)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admins) => {
                console.log("admin check", admins)
                res.send(admins.length > 0)
            })
    })



})

app.get('/', (req, res) => {
    res.send('GET request to the homepage')
})

app.listen(process.env.PORT || port)