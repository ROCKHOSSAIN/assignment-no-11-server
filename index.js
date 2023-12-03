const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const cookieParser = require('cookie-parser')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

//middleware;
// 'http://localhost:5173'
app.use(cors({
  origin:[
    'https://boring-toothpaste.surge.sh',
    'https://library-management-syste-12005.web.app',
    'https://library-management-syste-12005.firebaseapp.com'
  ],
  credentials:true
}))
app.use(express.json());
app.use(cookieParser());
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

//middlewares
const logger = (req,res,next)=>{
  console.log('log:info',req.method,req.url);
  next();
}
const verifyToken=(req,res,next)=>{
  const token = req?.cookies?.token;
  // console.log('token in the middleware',token)
  if(!token){
    return res.status(401).send({message:'unauthorized access'})
  }
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
    if(err){
      return res.status(401).send({message:'unauthorized access'})
    }
    req.user = decoded
  })
  next();
}

async function run() {
  try {

      // await client.close();
    const booksCollection = client.db('libraryDB').collection('bookCollection')
    const borrowCollection = client.db('borrowDB').collection('borrowCollection')
    //jwt 
    app.post('/jwt',async(req,res)=>{
      const user = req.body;
      console.log('user for token',user);
      const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
      res.cookie('token',token,{
        httpOnly:true,
        secure:true,
        sameSite:'none'
    })
    .send({success:true,token})
    })
    app.post('/logout',verifyToken,async(req,res)=>{
      const user = req.body;
      console.log('logging out user',user)
      console.log('cook cookies',req.cookies)
      res.clearCookie('token',{maxAge:0}).send({success:true})
    })


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
    
    app.get('/allbooks/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await booksCollection.findOne(query)
      res.send(result)
    })
    app.put('/allbooks/:id',async(req,res)=>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const options = {upsert :true }
      const updatedBook = req.body;
      const book = {
        $set:{
          name: updatedBook.name,
          category: updatedBook.category,
          image: updatedBook.image,
          author: updatedBook.author,
          rating: updatedBook.rating,
          description: updatedBook.description,
          quantity:updatedBook.quantity
        }
      }
      const result = await booksCollection.updateOne(filter,book,options)
      res.send(result)
    })
    app.patch('/allbooks/:id',async(req,res)=>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      // const options = {upsert :true }
      const updatedquantity = req.body;
      const bookquantity = {
        $set:{
          quantity: updatedquantity.quantity,
         
        }
      }
      const result = await booksCollection.updateOne(filter,bookquantity)
      res.send(result)
    })

    //borrow data create mongodb
    app.post('/borrowbook',async(req,res)=>{
      const borrowBody = req.body
      console.log(borrowBody)
      const result = await borrowCollection.insertOne(borrowBody)
      res.send(result)
    })
    //borrow get
    app.get('/borrowbook',async(req,res)=>{
      const cursor = borrowCollection.find()
      const result = await cursor.toArray(cursor)
      res.send(result)
    })

    app.delete('/borrowbook/:id',async(req,res)=>{
      const id = req.params.id
      const query ={_id:new ObjectId(id)};
      const result = await borrowCollection.deleteOne(query)
      res.send(result);
    })

    //auth realted api
   
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
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