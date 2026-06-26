const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const dbUrl = `mongodb+srv://${process.env.EMAIL}:${process.env.PASSWORD}@cluster0.v5ee5wa.mongodb.net/${process.env.DB_NAME}`

console.log("dbUr", dbUrl)
module.exports = { dbUrl }

