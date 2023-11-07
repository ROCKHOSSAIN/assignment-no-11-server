const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

//middleware;
app.use(cors())
app.use(express.json());
// /LibraryManagement
//o8hcw2gQ2xn8asVV

// const uri = "mongodb+srv://LibraryManagement:o8hcw2gQ2xn8asVV@cluster0.vh2cr5s.mongodb.net/?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vh2cr5s.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

      await client.close();
    const booksCollection = client.db('libraryDB').collection('bookCollection')
    app.post('/allbooks',async(req,res)=>{
        const newBook = req.body;
        console.log(newBook);
        const result = await booksCollection.insertOne(newBook)
        res.send(result)
    })
    app.get('/allbooks',async(req,res)=>{
        const cursor = booksCollection.find();
        const result = await cursor.toArray(cursor)
        res.send(result);
    })


    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('Library making sever is running')
})
app.listen(port,()=>{
    console.log(`Library server is running on port : ${port}`)
})