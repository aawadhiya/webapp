
var passwordValidator = require('password-validator');

// Create a schema
var schema = new passwordValidator();

// Add properties to it
schema
    .is().min(8)                                    // Minimum length 8
    .is().max(100)                                  // Maximum length 100
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits()                                 // Must have digits
    .has().not().spaces()                           // Should not have spaces
    .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

module.exports = schema;

// Rules

// Rules supported as of now are:
// Rules 	Descriptions
// digits() 	specifies password must include digits
// letters() 	specifies password must include letters
// lowercase() 	specifies password must include lowercase letters
// uppercase() 	specifies password must include uppercase letters
// symbols() 	specifies password must include symbols
// spaces() 	specifies password must include spaces
// min(len) 	specifies minimum length
// max(len) 	specifies maximum length
// oneOf(list) 	specifies the whitelisted values
// not([regex]) 	inverts the result of validations applied next
// is() 	inverts the effect of not()
// has([regex]) 	inverts the effect of not() and applies a regex (optional)
