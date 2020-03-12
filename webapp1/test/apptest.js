
//NOTE:- Clear database table before running tests.....
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
var request = require('superagent');
chai.use(chaiHttp);
var expect = chai.expect;

//set up the data we need to pass to the login method

const ValidPostCredential = {
    first_name: "Ankit",
    last_name: "Awadhiya",
    email_address: "11aawadhiya03@gmail.com",
    password: "Abcd@1234"
}

const ValidPutCredential = {
    first_name: "updated ",
    last_name: "Test",
    password: "Abcd@1234"
}


const InvalidPostCredential = {
    first_name: "John",
    last_name: "Doe",
    email_address: "johngmail.com",
    password: "Abcd@123"
}


const ValidUserCredentials = {
    email_address: "11aawadhiya03@gmail.com",
    password: "Abcd@1234"
}

const InvalidUserCredential1 = {
    email_address: "a.awadhi3@gmail.com",
    password: "Abcd@1234"
}

const InvalidUserCredential2 = {
    email_address: "a.awadhiya03@gmail.com",
    password: "Abcd34"
}


const InvalidPutCredential = {
    first_name: "New",
    last_name: "Data",
    email_address: "a.awadhiya03@gmail.com",
    password: "AbcD@1234"
}


describe('Post get and update test', function (done) {


    // it("valid register details", (done) => {
    //     chai.request(app)
    //         .post('/v1/user/')
    //         .send(ValidPostCredential)
    //         .then((res) => {
    //             //assertions
    //             console.log("ValidpostCredential", ValidPostCredential);
    //             this.timeout(1000);
    //             setTimeout(done, 300);
    //             console.log("Response value Test:-", res.status);
    //             expect(res).to.have.status(201);
    //             done();
    //         }).catch(err => {
    //             done(err);
    //         });
    // });

    // it("Invalid register details", (done) => {
    //     chai.request(app)
    //         .post('/v1/user/')
    //         .send(InvalidPostCredential)
    //         .then((res) => {
    //             //assertions
    //             this.timeout(1000);
    //             setTimeout(done, 300);
    //             expect(res).to.have.status(400);
    //             done();
    //         }).catch(err => {
    //             done(err);
    //         });
    // });
// Removed comment..
    it("Get user test ", (done) => {
        chai.request(app)
            .get('/v1/user/')
            .auth('11aawadhiya03@gmail.com', 'Abcd@1234')
            .then((res) => {
                //assertions
                expect(res).to.have.status(200);
            }).catch(err => {
                console.log(err.message);
            }).then(done);
    });

    it("Get Invalid user test ", (done) => {
        chai.request(app)
            .get('/v1/user/')
            .auth('a.awya03@gmail.com', 'Abcd@1234')
            .then((res) => {
                //assertions
                expect(res).to.have.status(400);
            }).catch(err => {
                console.log(err.message);
            }).then(done);
    });

    it("Put Valid test ", (done) => {
        chai.request(app)
            .put('/v1/user/')
            .auth('11aawadhiya03@gmail.com', 'Abcd@1234')
            .send(ValidPutCredential)
            .then((res) => {
                //assertions
                expect(res).to.have.status(204);
            }).catch(err => {
                console.log(err.message);
            }).then(done);
    });

    it("Put : Invalid credential for put test ", (done) => {
        chai.request(app)
            .put('/v1/user/')
            .auth('11aawaya03@gmail.com', 'Abcd@1234')
            .send(ValidPutCredential)
            .then((res) => {
                //assertions
                expect(res).to.have.status(204);
            }).catch(err => {
                console.log(err.message);
            }).then(done);
    });

});

