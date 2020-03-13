// connect to the database....

var mysql = require('mysql');
require('dotenv').config()


var connnection = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.DBpassword,
  port     : process.env.port,
  DBName: process.env.DBName 
});

connnection.connect(function (err) {
  console.log("connected")
  if (err) {
  console.log(err);
  return err.message;}

  console.log("Connected to the MySQL server.");
  var usersql = "CREATE TABLE IF NOT EXISTS `csye6225`.`users` (" +
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
    if (err){ 
      console.log("allready exist");
  }
    else{
      console.log("User table created");
    }
    
  });

    var billsql = "CREATE TABLE IF NOT EXISTS `csye6225`.`bill` (" +
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
    "`attachment` varchar(10000) COLLATE utf8_unicode_ci ," +
    "FOREIGN KEY(`owner_id`) REFERENCES `users`( `id`)," +
    "PRIMARY KEY (`id`)" +  
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;"

    connnection.query(billsql, function (err, result) {
      if (err){
        console.log("allready exist", err);
      } 
      else{
        console.log("bill table created");
      }
      
    });   


    var filesql = "CREATE TABLE IF NOT EXISTS `csye6225`.`File` (" +
    "`id` varchar(100) NOT NULL ," +
    "`file_name` varchar(150) COLLATE utf8_unicode_ci  NOT NULL," +
    "`url` varchar(100)  NOT NULL," +
    "`upload_date` DATE NOT NULL," +
    "`bill_id` varchar(100) NOT NULL," +
    "`AcceptRanges` VARCHAR(254) NOT NULL," +
    "`LastModified` VARCHAR(254) NOT NULL," +
    "`ContentLength` VARCHAR(254) NOT NULL," +
    "`ETag` VARCHAR(254) NOT NULL," +
    "`ContentType` VARCHAR(254) NOT NULL," +
    "FOREIGN KEY(`bill_id`) REFERENCES `bill`( `id`)," +
    "PRIMARY KEY (`id`)" +  
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;"

    
    connnection.query(filesql, function (err, result) {
      if (err){ 
        console.log("allready exist file table", err);
      }
      else{
        console.log("File table created");
      }
     
    });

});



module.exports = connnection;

// code to save user to the database
