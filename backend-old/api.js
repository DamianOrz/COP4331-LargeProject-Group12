const { ObjectId } = require('mongodb');
const { Router } = require('express');
const token = require('./createJWT.js');

const router = new Router();

    router.post('/api/login', async (req, res, next) =>
    {
        // incoming: login, password
        // outgoing: accessToken, error (User info is inside the token payload!)
        var error = '';
        const { login, password } = req.body;

        try {
            const db = client.db('cop4331');
            const results = await db.collection('users').find({email: login, passwordHash: password}).toArray();

            // Fallback: Check 'password' field in case plain passwords are stored during testing
            if (results.length === 0) {
                const legacyResults = await db.collection('users').find({email: login, password: password}).toArray();
                if (legacyResults.length > 0) results.push(...legacyResults);
            }

            if( results.length > 0 )
            {
                var id = results[0]._id;
                var fn = results[0].firstName;
                var ln = results[0].lastName;

                // Generate the secure token packet instead of passing raw strings
                var ret = token.createToken(fn, ln, id, login);
                res.status(200).json(ret);
            }
            else
            {
                error = 'Invalid user credentials';
                res.status(200).json({ error: error });
            }
        } catch(e) {
            res.status(200).json({ error: e.toString() });
        }
    });

    // LIVE REGISTER ENDPOINT
    router.post('/api/register', async (req, res, next) =>
    {
        // incoming: firstName, lastName, email, password
        // outgoing: error, accessToken
        var error = '';
        const { firstName, lastName, email, password } = req.body;

        try {
            const db = client.db('cop4331');
            
            // Check if email already exists
            const existingUser = await db.collection('users').findOne({ email: email });
            if (existingUser) {
                return res.status(200).json({ error: "A user with that email already exists" });
            }

            const newUser = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                passwordHash: password, // In production, hash this password using bcrypt
                isEmailVerified: false,
                createdAt: new Date()
            };

            const result = await db.collection('users').insertOne(newUser);
            var ret = token.createToken(firstName, lastName, result.insertedId, email);
            res.status(200).json(ret);
        } catch(e) {
            res.status(200).json({ error: e.toString() });
        }
    });

    // =========================================================================
    // 2. RECIPE ENDPOINTS (cop4331 -> recipes)
    // =========================================================================

    // LIST / SEARCH RECIPES
    router.post('/api/recipes/list', async (req, res, next) => {
        // incoming: userId, search, mealType, jwtToken
        // outgoing: { recipes: [], error: '', jwtToken: '' }
        var error = '';
        const { userId, search, mealType, jwtToken } = req.body;

        if (jwtToken && token.isExpired(jwtToken)) {
            return res.status(200).json({ error: "The JWT is no longer valid", jwtToken: '' });
        }

        try {
            const db = client.db('cop4331');
            const query = {};

            if (userId) {
                query.userId = tryParseObjectId(userId);
            }

            if (search && search.trim() !== '') {
                const regex = new RegExp(search.trim(), 'i');
                query.$or = [
                    { recipeName: { $regex: regex } },
                    { description: { $regex: regex } }
                ];
            }

            if (mealType && mealType !== 'all') {
                query.mealType = mealType;
            }

            const results = await db.collection('recipes').find(query).sort({ createdAt: -1 }).toArray();
            var refreshedToken = jwtToken ? token.refresh(jwtToken).accessToken : '';
            res.status(200).json({ recipes: results, error: error, jwtToken: refreshedToken });
        } catch (e) {
            res.status(200).json({ recipes: [], error: e.toString(), jwtToken: '' });
        }
    });

    // GET SINGLE RECIPE
    router.post('/api/recipes/get', async (req, res, next) => {
        // incoming: recipeId, jwtToken
        // outgoing: { recipe: {}, error: '', jwtToken: '' }
        var error = '';
        const { recipeId, jwtToken } = req.body;

        if (jwtToken && token.isExpired(jwtToken)) {
            return res.status(200).json({ error: "The JWT is no longer valid", jwtToken: '' });
        }

        try {
            const db = client.db('cop4331');
            const result = await db.collection('recipes').findOne({ _id: tryParseObjectId(recipeId) });
            
            var refreshedToken = jwtToken ? token.refresh(jwtToken).accessToken : '';
            res.status(200).json({ recipe: result, error: error, jwtToken: refreshedToken });
        } catch (e) {
            res.status(200).json({ recipe: null, error: e.toString(), jwtToken: '' });
        }
    });

    // CREATE RECIPE
    router.post('/api/recipes/create', async (req, res, next) => {
        // incoming: userId, recipeName, description, ingredients[], instructions[], mealType, prepTime, servings, jwtToken
        // outgoing: { recipe: {}, error: '', jwtToken: '' }
        var error = '';
        const { userId, recipeName, description, ingredients, instructions, mealType, prepTime, servings, jwtToken } = req.body;

        if (jwtToken && token.isExpired(jwtToken)) {
            return res.status(200).json({ error: "The JWT is no longer valid", jwtToken: '' });
        }

        try {
            const db = client.db('cop4331');
            const newRecipe = {
                userId: tryParseObjectId(userId),
                recipeName: recipeName,
                description: description || "",
                ingredients: ingredients || [],
                instructions: instructions || [],
                mealType: mealType,
                prepTime: Number(prepTime) || 0,
                servings: Number(servings) || 1,
                createdAt: new Date()
            };

            const result = await db.collection('recipes').insertOne(newRecipe);
            newRecipe._id = result.insertedId;

            var refreshedToken = jwtToken ? token.refresh(jwtToken).accessToken : '';
            res.status(200).json({ recipe: newRecipe, error: error, jwtToken: refreshedToken });
        } catch (e) {
            res.status(200).json({ recipe: null, error: e.toString(), jwtToken: '' });
        }
    });

    // UPDATE RECIPE
    router.post('/api/recipes/update', async (req, res, next) => {
        // incoming: recipeId, recipeName, description, ingredients[], instructions[], mealType, prepTime, servings, jwtToken
        // outgoing: { recipe: {}, error: '', jwtToken: '' }
        var error = '';
        const { recipeId, recipeName, description, ingredients, instructions, mealType, prepTime, servings, jwtToken } = req.body;

        if (jwtToken && token.isExpired(jwtToken)) {
            return res.status(200).json({ error: "The JWT is no longer valid", jwtToken: '' });
        }

        try {
            const db = client.db('cop4331');
            const updateFields = {
                recipeName: recipeName,
                description: description,
                ingredients: ingredients,
                instructions: instructions,
                mealType: mealType,
                prepTime: Number(prepTime),
                servings: Number(servings)
            };

            const result = await db.collection('recipes').findOneAndUpdate(
                { _id: tryParseObjectId(recipeId) },
                { $set: updateFields },
                { returnDocument: 'after' }
            );

            var refreshedToken = jwtToken ? token.refresh(jwtToken).accessToken : '';
            res.status(200).json({ recipe: result, error: error, jwtToken: refreshedToken });
        } catch (e) {
            res.status(200).json({ recipe: null, error: e.toString(), jwtToken: '' });
        }
    });

    // DELETE RECIPE
    router.post('/api/recipes/delete', async (req, res, next) => {
        // incoming: recipeId, jwtToken
        // outgoing: { error: '', jwtToken: '' }
        var error = '';
        const { recipeId, jwtToken } = req.body;

        if (jwtToken && token.isExpired(jwtToken)) {
            return res.status(200).json({ error: "The JWT is no longer valid", jwtToken: '' });
        }

        try {
            const db = client.db('cop4331');
            await db.collection('recipes').deleteOne({ _id: tryParseObjectId(recipeId) });

            var refreshedToken = jwtToken ? token.refresh(jwtToken).accessToken : '';
            res.status(200).json({ error: error, jwtToken: refreshedToken });
        } catch (e) {
            res.status(200).json({ error: e.toString(), jwtToken: '' });
        }
    });

    // =========================================================================
    // 3. MEAL PLAN ENDPOINTS (cop4331 -> meal_plans)
    // =========================================================================

    // GET WEEKLY MEAL PLAN
    router.post('/api/mealplans/get', async (req, res, next) => {
        // incoming: userId, weekStartDate, jwtToken
        // outgoing: { mealPlan: {}, error: '', jwtToken: '' }
        var error = '';
        const { userId, weekStartDate, jwtToken } = req.body;

        if (jwtToken && token.isExpired(jwtToken)) {
            return res.status(200).json({ error: "The JWT is no longer valid", jwtToken: '' });
        }

        try {
            const db = client.db('cop4331');
            const userObjectId = tryParseObjectId(userId);

            const query = { userId: userObjectId };
            if (weekStartDate) {
                query.weekStartDate = new Date(weekStartDate);
            }

            let plan = await db.collection('meal_plans').findOne(query);
            
            // If no plan exists for this week yet, return an empty template
            if (!plan) {
                plan = {
                    _id: null,
                    userId: userObjectId,
                    weekStartDate: weekStartDate ? new Date(weekStartDate) : new Date(),
                    plannedMeals: [],
                    createdAt: new Date()
                };
            }

            var refreshedToken = jwtToken ? token.refresh(jwtToken).accessToken : '';
            res.status(200).json({ mealPlan: plan, error: error, jwtToken: refreshedToken });
        } catch (e) {
            res.status(200).json({ mealPlan: null, error: e.toString(), jwtToken: '' });
        }
    });

    // SAVE / UPDATE WEEKLY MEAL PLAN
    router.post('/api/mealplans/save', async (req, res, next) => {
        // incoming: userId, weekStartDate, plannedMeals[], jwtToken
        // outgoing: { mealPlan: {}, error: '', jwtToken: '' }
        var error = '';
        const { userId, weekStartDate, plannedMeals, jwtToken } = req.body;

        if (jwtToken && token.isExpired(jwtToken)) {
            return res.status(200).json({ error: "The JWT is no longer valid", jwtToken: '' });
        }

        try {
            const db = client.db('cop4331');
            const userObjectId = tryParseObjectId(userId);

            const filter = { 
                userId: userObjectId, 
                weekStartDate: new Date(weekStartDate) 
            };

            const formattedMeals = (plannedMeals || []).map(meal => ({
                dayOfWeek: meal.dayOfWeek,
                mealType: meal.mealType,
                recipeId: tryParseObjectId(meal.recipeId),
                plannedDate: meal.plannedDate || "",
                notes: meal.notes || ""
            }));

            const updateDoc = {
                $set: {
                    userId: userObjectId,
                    weekStartDate: new Date(weekStartDate),
                    plannedMeals: formattedMeals
                },
                $setOnInsert: {
                    createdAt: new Date()
                }
            };

            const result = await db.collection('meal_plans').findOneAndUpdate(
                filter,
                updateDoc,
                { upsert: true, returnDocument: 'after' }
            );

            var refreshedToken = jwtToken ? token.refresh(jwtToken).accessToken : '';
            res.status(200).json({ mealPlan: result, error: error, jwtToken: refreshedToken });
        } catch (e) {
            res.status(200).json({ mealPlan: null, error: e.toString(), jwtToken: '' });
        }
    });

    // =========================================================================
    // 4. LEGACY CARD ENDPOINTS (COP4331Cards -> Cards)
    // =========================================================================

    router.post('/api/addcard', async (req, res, next) =>
    {
        const { userId, card, jwtToken } = req.body;
        if (token.isExpired(jwtToken)) {
            res.status(200).json({ error: "The JWT is no longer valid", jwtToken: '' });
            return;
        }
        const newCard = {Card:card,UserId:userId};
        var error = '';
        try {
            const db = client.db('COP4331Cards');
            const result = await db.collection('Cards').insertOne(newCard);
        } catch(e) {
            error = e.toString();
        }
        var refreshedToken = token.refresh(jwtToken);
        var ret = { error: error, jwtToken: refreshedToken.accessToken };
        res.status(200).json(ret);
    });

    router.post('/api/searchcards', async (req, res, next) =>
    {
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
        for( var i=0; i<results.length; i++ ) {
            _ret.push( results[i].Card );
        }
        var refreshedToken = token.refresh(jwtToken);
        var ret = {results:_ret, error:error, jwtToken: refreshedToken.accessToken};
        res.status(200).json(ret);
    });

module.exports = router;

// Helper function: safely converts string IDs to MongoDB ObjectIds without throwing errors
function tryParseObjectId(id) {
    try { 
        return new ObjectId(id); 
    } catch(e) { 
        return id; 
    }
}