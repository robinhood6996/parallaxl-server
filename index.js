const express = require('express');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');
const res = require('express/lib/response');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const fileUpload = require('express-fileupload');



/*========= Middleware============== */
app.use(cors());
app.use(express.json());
app.use(fileUpload());

/*MongoDB conncetion details */
const uri = `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.m62xz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {

    try {
        await client.connect();
        const database = client.db("parallaxl");
        const postsCollection = database.collection('posts');
        const usersCollection = database.collection('users');

        /* =========User data Post api for save user email,name,role, in db=== */
        app.post('/users', async (req, res) => {
            const user = req.body;
            user.role = 'user';
            user.status = 0;
            const result = await usersCollection.insertOne(user)
            res.send(result)
        });

        //Get all user
        app.get('/users', async (req, res) => {
            const users = usersCollection.find({});
            const result = await users.toArray();
            res.json(result);
        })

        //Get user by email
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            // let isAdmin = false;
            // if (user?.role === 'admin') {
            //     isAdmin = true;
            // }
            res.json(user);
        })



        //User status change
        app.put('/users/status/:email', async (req, res) => {
            const email = req.params.email;
            const data = req.body;
            const query = { email: email };
            const updateDoc = { $set: data };
            const user = await usersCollection.updateOne(query, updateDoc);
            res.json(user);
        })

        //make user to staff
        app.put('/users/staff', async (req, res) => {
            const email = req.body.email;
            const role = req.body.role;
            const filter = { email: email }
            const updateDoc = {
                $set: {
                    role: role
                }
            }
            const user = await usersCollection.updateOne(filter, updateDoc)
            res.json(user)
        })


        //Add Post API
        app.post('/posts', async (req, res) => {
            const data = req.body;
            const title = data.title;
            const date = data.date;
            const description = data.description;
            const author = data.author;
            const picData = req.files.image.data;
            const encodedPic = picData.toString('base64');
            const picBuffer = Buffer.from(encodedPic, 'base64');
            const post = {
                title, date, description, image: picBuffer, status: 0, comment: [], author
            }
            const result = await postsCollection.insertOne(post);
            res.json(result);
        });

        //Get Pending Posts
        app.get('/posts/pending', async (req, res) => {
            const posts = postsCollection.find({ status: 0 });
            const result = await posts.toArray();
            res.json(result);
        });

        //Get All Posts
        app.get('/posts', async (req, res) => {
            const posts = postsCollection.find({ status: 1 });
            const result = await posts.toArray();
            res.json(result);
        });
        // //Get All Posts
        // app.get('/posts/comment/:id', async (req, res) => {
        //     const post = { _id: ObjectId(id) }
        //     const posts = postsCollection.find({ comment });
        //     const result = await posts.toArray();
        //     res.json(result);
        // });


        //Get SIngle Blog
        app.get('/posts/:id', async (req, res) => {
            const id = req.params;
            const query = { _id: ObjectId(id) }
            const result = await postsCollection.findOne(query);
            res.json(result);
        });

        //Post status change to Approve
        app.put('/posts/status/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const data = req.body;
            const updateDoc = { $set: data };
            const updatedPost = await postsCollection.updateOne(filter, updateDoc);
            res.json(updatedPost);
        });

        //Delete Post
        app.delete('/posts/:id', async (req, res) => {
            const id = req.params;
            const query = { _id: ObjectId(id) };
            const result = await postsCollection.deleteOne(query);
            res.json(result);
        });

        //update comment
        app.put('/posts/comment/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const data = req.body;
            const comment = { comment: data }
            const updateDoc = { $set: comment };
            const updatedPost = await postsCollection.updateOne(filter, updateDoc);
            res.json(updatedPost);
        });


    }
    finally {
        //   await client.close();
    }
}

run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Welcome to Parallaxl!')
})

app.listen(port, () => {
    console.log(`listening at :${port}`)
})
