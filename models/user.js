// connect to the database....
var mysql = require('mysql');

var connnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Master@123",
  database: "mydb"
});

connnection.connect(function (err) {
  if (err) return err.message;

  console.log("Connected to the MySQL server.");
  var usersql = "CREATE TABLE IF NOT EXISTS `mydb`.`users` (" +
    "`id` varchar(100) NOT NULL ," +
    "`first_name` varchar(100) COLLATE utf8_unicode_ci NOT NULL," +
    "`last_name` varchar(100) COLLATE utf8_unicode_ci NOT NULL," +
    "`email_address` varchar(100) COLLATE utf8_unicode_ci NOT NULL," +
    "`password` varchar(255) COLLATE utf8_unicode_ci NOT NULL," +
    "`account_created` datetime NOT NULL," +
    "`account_modified` datetime NOT NULL," +
    "PRIMARY KEY (`id`)" +
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;"

  connnection.query(usersql, function (err, result) {
    if (err) console.log("allready exist");
    console.log("User table created");
  });
});

module.exports = connnection;
