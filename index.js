const typeorm = require("typeorm");
const User = require("./model/User").User;

typeorm.createConnection({
    "type": "sqlite",
    "database": "data/magireco.db",
    "synchronize": true,
    "logging": false,
    "entities": [
        require("./entity/UserSchema"),
        require("./entity/MagiRecoUserSchema"),
        require("./entity/MegucaSchema"),
        require("./entity/MasterMegucaSchema"),
        require("./entity/MasterMemoriaSchema"),
        require("./entity/MemoriaSchema"),
        require("./entity/FriendSchema")
    ]
}).then(async connection => {

    // console.log("Inserting a new user into the database...");
    // const user = new User();
    // user.username = "100702184395513856";
    // user.name = "John";
    // user.discriminator = "2407";
    // user.friend_id = "Q69KBCAA";
    // user.notifications = true;
    // await connection.manager.save(user);
    // console.log("Saved a new user with id: " + user.username);
    
    console.log("Loading users from the database...");
    const users = await connection.manager.find(User);
    console.log("Loaded users: ", users);
    
    console.log("Here you can setup and run express/koa/any other framework.");
    const discord = require('./bot.js')
    
}).catch(error => console.log(error));
