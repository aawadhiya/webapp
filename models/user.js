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

    var billsql = "CREATE TABLE IF NOT EXISTS `mydb`.`bill` (" +
    "`id` varchar(100) NOT NULL ," +
    "`created_ts` datetime NOT NULL," +
    "`updated_ts` datetime NOT NULL," +
    "`owner_id` varchar(100) NOT NULL," +
    "`vendor` varchar(150) COLLATE utf8_unicode_ci  NOT NULL," +
    "`bill_date` DATE NOT NULL," +
    "`due_date` DATE NOT NULL," +
    "`amount_due` double NOT NULL," +
    "`categories` varchar(255)  COLLATE utf8_unicode_ci NOT NULL," +
    "`paymentStatus` varchar(255) COLLATE utf8_unicode_ci NOT NULL," +
    "FOREIGN KEY(`owner_id`) REFERENCES `users`( `id`)," +
    "PRIMARY KEY (`id`)" +  
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;"


    // var categorysql = "CREATE TABLE IF NOT EXISTS `mydb`.`category` (" +
    // "`id` varchar(100) NOT NULL ," +
    // "`categoryName` varchar(150) COLLATE utf8_unicode_ci  NOT NULL," +
    // "`bill_id` varchar(100)  NOT NULL," +
    // "FOREIGN KEY(`bill_id`) REFERENCES `bill`( `id`)," +
    // "PRIMARY KEY (`id`)" +  
    // ") ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;"

    connnection.query(billsql, function (err, result) {
      if (err) console.log("allready exist");
      console.log("bill table created");
    });

    // connnection.query(categorysql, function (err, result) {
    //   if (err) console.log("allready exist");
    //   console.log("category table created");
    // });

  connnection.query(usersql, function (err, result) {
    if (err) console.log("allready exist");
    console.log("User table created");
  });
});

module.exports = connnection;

// code to save user to the database
