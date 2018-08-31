const db = require('./models');

db.User.create({
    email: 'a@aol.com',
    password: 'hunter2'
}, 
function (err, createdUser) {
    if (err) {
    console.log(err);
    return;
        } else {
        console.log(createdUser);
        process.exit();
}
})