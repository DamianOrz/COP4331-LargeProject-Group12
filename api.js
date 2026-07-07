require('express');
require('mongodb');

// Import the token utility sitting in the same folder
const token = require('./createJWT.js');

exports.setApp = function ( app, client )
{
    // 1. LIVE ADD CARD ENDPOINT (JWT Protected)
    app.post('/api/addcard', async (req, res, next) =>
    {
        // incoming: userId, card, jwtToken
        // outgoing: error, jwtToken

        const { userId, card, jwtToken } = req.body;

        // Check if the incoming token is dead
        if (token.isExpired(jwtToken)) {
            res.status(200).json({ error: "The JWT is no longer valid", jwtToken: '' });
            return;
        }

        const newCard = {Card:card,UserId:userId};
        var error = '';

        try
        {
            const db = client.db('COP4331Cards');
            const result = db.collection('Cards').insertOne(newCard);
        }
        catch(e)
        {
            error = e.toString();
        }

        // Refresh the token so the user stays securely logged in while being active
        var refreshedToken = token.refresh(jwtToken);

        var ret = { error: error, jwtToken: refreshedToken.accessToken };
        res.status(200).json(ret);
    });

    // 2. LIVE LOGIN ENDPOINT (Generates Initial JWT)
    app.post('/api/login', async (req, res, next) =>
    {
        // incoming: login, password
        // outgoing: accessToken, error (User info is inside the token payload!)

        var error = '';
        const { login, password } = req.body;

        const db = client.db('cop4331');
        const results = await db.collection('users').find({email: login, password: password}).toArray();

        var id = -1;
        var fn = '';
        var ln = '';

        if( results.length > 0 )
        {
            id = results[0]._id; // fixed casing to match actual DB field
            fn = results[0].firstName;
            ln = results[0].lastName;

            // Generate the secure token packet instead of passing raw strings
            var ret = token.createToken(fn, ln, id);
            res.status(200).json(ret);
        }
        else
        {
            error = 'Invalid user credentials';
            res.status(200).json({ error: error });
        }
    });

    // 3. LIVE SEARCH CARDS ENDPOINT (JWT Protected)
    app.post('/api/searchcards', async (req, res, next) =>
    {
        // incoming: userId, search, jwtToken
        // outgoing: results[], error, jwtToken

        var error = '';
        const { userId, search, jwtToken } = req.body;

        if (token.isExpired(jwtToken)) {
            res.status(200).json({ error: "The JWT is no longer valid", jwtToken: '' });
            return;
        }

        var _search = search.trim();

        const db = client.db('COP4331Cards');
        const results = await db.collection('Cards').find({"Card":{$regex:_search+'.*', $options:'i'}, UserId: userId}).toArray();

        var _ret = [];
        for( var i=0; i<results.length; i++ )
        {
            _ret.push( results[i].Card );
        }

        var refreshedToken = token.refresh(jwtToken);

        var ret = {results:_ret, error:error, jwtToken: refreshedToken.accessToken};
        res.status(200).json(ret);
    });
}