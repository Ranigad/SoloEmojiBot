const typeorm = require("typeorm");
const User = require("./model/User").User;
const Guild = require("./model/Guild").Guild;
const Role = require("./model/Role").Role;

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
        require("./entity/FriendSchema"),
        require("./entity/GuildSchema"),
        require("./entity/RoleSchema")
    ]
}).then(async connection => {

    const role = new Role();
    role.username = "100702184395513856";
    role.role = "developer";
    await connection.manager.save(role);

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
    //console.log("Loaded users: ", users);
    
    const discord = require('./bot.js')

    const guilds = await connection.manager.find(Guild);
    if (guilds == undefined || guilds.length == 0) {
        let testserver = new Guild("471030229629009925", "\\");
        await connection.manager.save(testserver);
        let madocord = new Guild("364704870177046531", "\\");
        await connection.manager.save(madocord);
    }

}).catch(error => console.log(error));
