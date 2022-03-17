const express = require('express');
const cors = require('cors');
const passport = require('passport');
const Web3Strategy = require('passport-dapp-web3');

//setup express app
const app = express();
app.use(express.json());

/**use dependencies*/
app.use(cors());

//start server
app.listen(process.env.PORT || 6969);
console.log('listening on port 6969');

/**
 * Called when authorization succeeds. Perform any additional verification here,
 * and either return the user's data (if valid), or deny authorization by
 * passing an error to the `done` callback.
 */
const onAuth = (address, message, signed, done) => {
    // optional additional validation. To deny auth:
    // done(new Error('User is not authorized.'));
    // User.findOne({ address }, (err, user) => done(err, user));
    done(null, address);
};
const web3Strategy = new Web3Strategy(onAuth);

passport.use(web3Strategy);

// idk why we need this passport is wack
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.options('*', cors())

// endpoint
app.post('/login', passport.authenticate('web3', { successRedirect: '/authed', failureRedirect: '/login', }));

app.get('/authed', function(req, res) {
    console.log('hit thing');
    res.status(200).send({ message: 'ya ur good bud' });
})

app.get('/login', function(req, res) {
    res.status(418).send('login');
});