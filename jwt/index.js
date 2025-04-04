const express = require('express');
const router = express();
const bodypaser = require('body-parser');
const jwt = require('jsonwebtoken');
router.use(bodypaser.json());
router.use(bodypaser.urlencoded({ extended: true }));
let users = (require('./user.json'));
let rewards = (require('./reward.json'));

router.post('/', (req, res) => {
    res.json({ message: 'Hello World' });
},);
router.post('/login', (req, res) => {
    // let user_name = req.body.username;
    // let password = req.body.password;
    let user_name = 'Anand';
    let password = '123';
    console.log(user_name, password);
    if (users.length > 0) {
        for (let i = 0; i < users.length; i++) {
            const element = users[i];
            console.log("toe", element);
            console.log(element.username, element.password);
            console.log("body", user_name, password);
            if (user_name === element.username && password === element.password) {
                console.log("login success");
                const token = jwt.sign({ id: element.id }, "vampire");
                console.log(token);
               return res.json({ message: "login success", token: token });
                // console.log("login success");
            }
        }
        return res.json({ message: "login failed" });
    }
    else {
        console.log("no user found");
        res.json({ message: "no user found" });
    }
},);
function VerifyToken(req, res, next) {
    const header_token = req.headers['authorization'];
    console.log(header_token);
    if (header_token) {
        jwt.verify(header_token, "vampire", (err, decoded) => {
            if (err) {
                res.json({ message: "invalid token" });
            }
            else {
                req.id = decoded.id;
                next();
            }
        });
    }
    else {
        res.json({ message: "no token provided" });
    }
}
router.get('/rewards', VerifyToken, (req, res) => {
    const reward = rewards.filter(reward => reward.id === req.id);
    res.json({
        rewarddata: reward
    });
},);
router.listen(6000, () => {
    console.log('server is running on port 6000');
});
module.exports = router;