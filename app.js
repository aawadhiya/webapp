const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/user.routes");
const app = express();
app.use(bodyParser.urlencoded({extended:true }));
app.use(bodyParser.json());
// Import user routes..
app.use('/v1',userRoutes);
const port = 3001;
// for body-parser....true/false??

app.use(function(req, res, next){
    if (req.accepts('html')) {
        res.status(400).send({message:"Bad  Request"}) ;
        return;
          }
        });

// Setting up the server....
app.listen(port, () => {
    console.log("server is running on port number " + port+ "..." );
});

module.exports = app;