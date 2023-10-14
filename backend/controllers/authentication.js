const router = require('express').Router()
const db = require("../models")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');     
const { User } = db
const process = require('process')

router.post('/', async (req, res) => {
    
    let user = await User.findOne({
        where: { email: req.body.email }
    })

    if (!user || !await bcrypt.compare(req.body.password, user.passwordDigest)) {
        res.status(404).json({ 
            message: `Could not find a user with the provided username and password` 
        })
    } else {
        const secretKey = process.env.JWT_SECRET;
        const payload = { id: user.userId };
        const result = jwt.sign(payload, secretKey);     
        res.json({ user: user, token: result })  
    }
})

router.get('/profile', async (req, res) => {
    try {
        // Split the authorization header into [ "Bearer", "TOKEN" ]:
        const [authenticationMethod, token] = req.headers.authorization.split(' ')

        // Only handle "Bearer" authorization for now 
        //  (we could add other authorization strategies later):
        if (authenticationMethod == 'Bearer') {
            // Decode the JWT ***
            const result = await jwt.decode(token)
            // Get the logged in user's id from the payload
            const { id } = result.id

            // Find the user object using their id:
            let user = await User.findOne({
                where: {
                    userId: result.id
                }
            })
            res.json(user)
        }
    } catch {
        res.json(null)
    }
})

module.exports = router

