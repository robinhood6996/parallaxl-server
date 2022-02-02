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
            console.log(result);
        });

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

        //User Insert To Database
        app.post('/user', async (req, res) => {
            const data = req.body;
            console.log(data);
        });


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
            const post = { title, date, description, image: picBuffer, status: 0, comment: ['Robin:Thanks for this information'], author }
            const result = await postsCollection.insertOne(post);
            res.json(result);
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
