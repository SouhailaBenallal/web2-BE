// Rest Api express, bodyParseer, MongoClient, dotenv, cors and bcrypt

const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const bcrypt = require('bcryptjs/dist/bcrypt');
const jwt = require('jsonwebtoken');

// Create the mongo client  
const client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

// Let heroku do its thing with the port
const port = process.env.PORT || 1332;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());

//Root route
app.get('/', (req, res) => {
    res.status(300).redirect('/index.html');
});


// DONE - Return all universities from the database
app.get('/universities', async (req, res) => {
    try{
        // conncect to the db
        await client.connect();
        // retrieve the universities collection
        const collection = client.db('BEL-universities').collection('universities');
        const uni = await collection.find({}).toArray();
        // Send back the data with the response 
        res.status(200).send(uni);
    }
    catch(error){
        console.log(error);
        res.status(500).send({
            error: 'An error has occured',
            value: error
        });
        }
    finally{
        client.close();
    }
} );

// DONE - Return one universitie from the database
app.get('/universities/:id', async (req, res) => {
    try{
        // conncect to the db
        await client.connect();
        // retrieve the universities collection
        const collection = client.db('BEL-universities').collection('universities');
        const uni = await collection.findOne({_id: ObjectId(req.params.id)});
        
        if(uni){
            res.status(200).send(uni);
            return
        }else{
            res.status(404).send('University could not be found with id:' + req.params.id);
            }
        }catch(error){
            console.log(error);
            res.status(500).send({
                error: 'An error has occured',
                value: error
            });
            }finally{
                client.close();
            }
} );

// DONE - Add a new university to the database
app.post('/universities', async (req, res) => {
    if(!req.body.name || !req.body.location || !req.body.website || !req.body.image || !req.body.description || !req.body.score){
        res.status(400).send('Please provide a name, location and website');
        return;
    }
    try{
        // conncect to the db
        await client.connect();
        // retrieve the universities collection
        const collection = client.db('BEL-universities').collection('universities');

        // Validation for double universities
        const uni = await collection.findOne({name: req.body.name, location: req.body.location, website: req.body.website, image: req.body.image, description: req.body.description, score: req.body.score});
        if(uni){
            res.status(400).send('University already exists');
            return;
        }

        // Create the new university
        let newUni = {
            name: req.body.name,
            location: req.body.location,
            website: req.body.website,
            image: req.body.image,
            description: req.body.description,
            score: req.body.score
        }
        
        // Insert the optional session field
        if(req.body.session){
            newUni.session = req.body.session;
        }
        // Add into the database
        let result = await collection.insertOne(newUni);
        // Send back the data with the response
        res.status(201).json(newUni);
        return;
        
    }catch(error){
        console.log(error);
        res.status(500).send({
            error: 'An error has occured',
            value: error
        });
        }finally{
            client.close();
        }
} );

// DONE - Update a university in the database
app.put('/universities/:id', async (req, res) => {
    //Check for bdody fields
    if(!req.body.name || !req.body.location || !req.body.website || !req.body.image || !req.body.description || !req.body.score){
        res.status(400).send('Please provide a name, location and website');
        return;
    }
    // Check for id in url
    if(!req.params.id){
        res.status(400).send('Please provide an id');
        return;
    }
    try{
        // conncect to the db
        await client.connect();
        // retrieve the universities collection
        const collection = client.db('BEL-universities').collection('universities');
        // Validation for double universities
        const uni = await collection.findOne({name: req.body.name, location: req.body.location, website: req.body.website, image: req.body.image, description: req.body.description, score: req.body.score});
        if(uni){
            res.status(400).send('University already exists');
            return;
        }
        // Update the university
        let result = await collection.updateOne({_id: ObjectId(req.params.id)}, {$set: {name: req.body.name, location: req.body.location, website: req.body.website, image: req.body.image, description: req.body.description, score: req.body.score}});
        // Send back the data with the response
        res.status(200).send(result);
        return;
    }
    catch(error){
        console.log(error);
        res.status(500).send({
            error: 'An error has occured',
            value: error
        });
        }finally{
            client.close();
        }
} );


// DONE - Delete a university from the database
app.delete('/universities/:id', async (req, res) => {
    // Check for id in url
    if(!req.params.id){
        res.status(400).send('Please provide an id');
        return;
    }
    try{
        // conncect to the db
        await client.connect();
        // retrieve the universities collection
        const collection = client.db('BEL-universities').collection('universities');
        // Delete the university
        let result = await collection.deleteOne({_id: ObjectId(req.params.id)});
        // Send back the data with the response
        res.status(200).send(result);
        return;
    }
    catch(error){
        console.log(error);
        res.status(500).send({
            error: 'An error has occured',
            value: error
        });
        }finally{
            client.close();
        }
} );


// DONE - Return all comments from the database
app.get('/comments', async (req, res) => {
    try{
        // conncect to the db
        await client.connect();
        // retrieve the users collection
        const collection = client.db('BEL-universities').collection('comments');
        // Find the user
        const comments = await collection.find().toArray();
        // Send back the data with the response
        res.status(200).send(comments);
    }
    catch(error){
        console.log(error);
        res.status(500).send({
            error: 'An error has occured',
            value: error
        });
        }finally{
            client.close();
        }
} );

// DONE - Return one comment from the database
app.get('/comments/:id', async (req, res) => {
    // Check for id in url
    if(!req.params.id){
        res.status(400).send('Please provide an id');
        return;
    }
    try{
        // conncect to the db
        await client.connect();
        // retrieve the users collection
        const collection = client.db('BEL-universities').collection('comments');
        // Find the user
        const comment = await collection.findOne({_id: ObjectId(req.params.id)});
        // Send back the data with the response
        res.status(200).send(comment);
    }
    catch(error){
        console.log(error);
        res.status(500).send({
            error: 'An error has occured',
            value: error
        });
        }finally{
            client.close();
        }
} );

// DONE - Add a comment to the database
app.post('/comments', async (req, res) => {
    // Check for body fields
    if(!req.body.name || !req.body.comment || !req.body.date){
        res.status(400).send('Please provide a name, comment and date');
        return;
    }
    try{
        // conncect to the db
        await client.connect();
        // retrieve the users collection
        const collection = client.db('BEL-universities').collection('comments');
        // Add into the database
        let result = await collection.insertOne(req.body);
        // Send back the data with the response
        res.status(201).json(req.body);
        return;
    }
    catch(error){
        console.log(error);
        res.status(500).send({
            error: 'An error has occured',
            value: error
        });
        }finally{
            client.close();
        }
} );

// DONE - Update a comment in the database
app.put('/comments/:id', async (req, res) => {
    //Check for bdody fields
    if(!req.body.name || !req.body.comment || !req.body.date){
        res.status(400).send('Please provide a name, comment and date');
        return;
    }
    // Check for id in url
    if(!req.params.id){
        res.status(400).send('Please provide an id');
        return;
    }
    try{
        // conncect to the db
        await client.connect();
        // retrieve the users collection
        const collection = client.db('BEL-universities').collection('comments');
        // Update the comment
        let result = await collection.updateOne({_id: ObjectId(req.params.id)}, {$set: {name: req.body.name, comment: req.body.comment, date: req.body.date}});
        // Send back the data with the response
        res.status(200).send(result);
        return;
    }
    catch(error){
        console.log(error);
        res.status(500).send({
            error: 'An error has occured',
            value: error
        });
        }finally{
            client.close();
        }
} );

// DONE - Delete a comment from the database
app.delete('/comments/:id', async (req, res) => {
    // Check for id in url
    if(!req.params.id){
        res.status(400).send('Please provide an id');
        return;
    }
    try{
        // conncect to the db
        await client.connect();
        // retrieve the users collection
        const collection = client.db('BEL-universities').collection('comments');
        // Delete the comment
        let result = await collection.deleteOne({_id: ObjectId(req.params.id)});
        // Send back the data with the response
        res.status(200).send(result);
        return;
    }
    catch(error){
        console.log(error);
        res.status(500).send({
            error: 'An error has occured',
            value: error
        });
        }finally{
            client.close();
        }
} );

// DONE - Return all users from the database
app.get('/users', async (req, res) => {
    try{
        // conncect to the db
        await client.connect();
        // retrieve the users collection
        const collection = client.db('BEL-universities').collection('users');
        const user = await collection.find({}).toArray();
        // Send back the data with the response 
        res.status(200).send(user);
    }
    catch(error){
        console.log(error);
        res.status(500).send({
            error: 'An error has occured',
            value: error
        });
        }
    finally{
        client.close();
    }
} );

// DONE - Login a user and return a JWT token
app.post('/login', async (req, res) => {
    if(!req.body.email || !req.body.password){
        res.status(400).send('Please provide an email and password');
        return;
    }
    try{
        // conncect to the db
        await client.connect();
        // retrieve the users collection
        const collection = client.db('BEL-universities').collection('users');
        // Validation for double users
        const user = await collection.findOne({email: req.body.email});
        if(!user){
            res.status(400).send('User does not exist');
            return;
        }
        // Check the password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if(!validPassword){
            res.status(400).send('Invalid password');
            return;
        }
        // Create the JWT token
        const token = jwt.sign({_id: user._id}, 'secret', {expiresIn: '1h'});
        const email = user.email;
        // Send back the data with the response
        res.status(200).json({token: token, email: email});
        return;
    }
    catch(error){
        console.log(error);
        res.status(500).send({
            error: 'An error has occured',
            value: error
        });
        }finally{
            client.close();
        }
} );

// DONE - Register a user in the database with JWT AND BCRYPT
app.post('/register', async (req, res) => {
    if(!req.body.email || !req.body.password || !req.body.username){
        res.status(400).send('Please provide an email, password and username');
        return;
    }
    try{
        // conncect to the db
        await client.connect();
        // retrieve the users collection
        const collection = client.db('BEL-universities').collection('users');
        // Validation for double users
        const user = await collection.findOne({email: req.body.email});
        if(user){
            res.status(400).send('User already exists');
            return;
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        // Create the user
        const newUser = {
            email: req.body.email,
            password: hashedPassword,
            username: req.body.username
        };
        // Insert the user
        const result = await collection.insertOne(newUser);
        // Send back the data with the response
        res.status(200).send(result);
        return;
    }
    catch(error){
        console.log(error);
        res.status(500).send({
            error: 'An error has occured',
            value: error
        });
        }finally{
            client.close();
        }
} );



const verifyToken = async (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.status(403).send('Forbidden');
    }
}



// DONE - Verify the JWT token and return the user
app.get('/users/me', verifyToken, async (req, res) => {
    try{
        // conncect to the db
        await client.connect();
        // retrieve the users collection
        const collection = client.db('BEL-universities').collection('users');
        // Find the user
        const user = await collection.findOne({_id: req.userId});
        // Send back the data with the response
        res.status(200).send(user);
    }
    catch(error){
        console.log(error);
        res.status(500).send({
            error: 'An error has occured',
            value: error
        });
        }finally{
            client.close();
        }
} );

// DONE - Delete a user from the database
app.delete('/users/:id', verifyToken, async (req, res) => {
    // Check for id in url
    if(!req.params.id){
        res.status(400).send('Please provide an id');
        return;
    }
    try{
        // conncect to the db
        await client.connect();
        // retrieve the users collection
        const collection = client.db('BEL-universities').collection('users');
        // Delete the user
        let result = await collection.deleteOne({_id: ObjectId(req.params.id)});
        // Send back the data with the response
        res.status(200).send(result);
        return;
    }
    catch(error){
        console.log(error);
        res.status(500).send({
            error: 'An error has occured',
            value: error
        });
        }finally{
            client.close();
        }
} );
// DONE - Update a user from the database
app.put('/users/:id', verifyToken, async (req, res) => {
    // Check for id in url
    if(!req.params.id){
        res.status(400).send('Please provide an id');
        return;
    }
    try{
        // conncect to the db
        await client.connect();
        // retrieve the users collection
        const collection = client.db('BEL-universities').collection('users');
        // Update the user
        let result = await collection.updateOne({_id: ObjectId(req.params.id)}, {$set: {name: req.body.name}});
        // Send back the data with the response
        res.status(200).send(result);
        return;
    }
    catch(error){
        console.log(error);
        res.status(500).send({
            error: 'An error has occured',
            value: error
        });
        }finally{
            client.close();
        }
} );

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}
);