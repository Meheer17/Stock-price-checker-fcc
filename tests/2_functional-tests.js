const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    test('Viewing one stock: GET request to /api/stock-prices/', function (done) {
        chai
            .request(server)
            .get('/api/stock-prices/')
            .query({ stock: 'GOOG' })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.property(res.body, 'stockData');
                assert.property(res.body.stockData, 'stock');
                assert.property(res.body.stockData, 'price');
                done();
            }).timeout(5000);
    });

    test('Viewing one stock and liking it: GET request to /api/stock-prices/', function (done) {
        chai
            .request(server)
            .get('/api/stock-prices/')
            .query({ stock: 'AAPL', like: true })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.property(res.body, 'stockData');
                assert.property(res.body.stockData, 'stock');
                assert.property(res.body.stockData, 'price');
                assert.property(res.body.stockData, 'likes');
                done();
            }).timeout(5000);
    });

    test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function (done) {
        chai
            .request(server)
            .get('/api/stock-prices/')
            .query({ stock: 'AAPL', like: true })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.property(res.body, 'stockData');
                assert.property(res.body.stockData, 'stock');
                assert.property(res.body.stockData, 'price');
                done();
            }).timeout(5000);
    });

    test('Viewing two stocks: GET request to /api/stock-prices/', function (done) {
        chai
            .request(server)
            .get('/api/stock-prices/')
            .query({ stock: ['GOOG', 'AAPL'] })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.property(res.body, 'stockData');
                assert.isArray(res.body.stockData);
                assert.property(res.body.stockData[0], 'stock');
                assert.property(res.body.stockData[0], 'price');
                assert.property(res.body.stockData[1], 'stock');
                assert.property(res.body.stockData[1], 'price');
                done();
            })
            .timeout(5000);
    });

    test('Viewing two stocks and liking them: GET request to /api/stock-prices/', function (done) {
        chai
            .request(server)
            .get('/api/stock-prices/')
            .query({ stock: ['GOOG', 'AAPL'], like: true })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.property(res.body, 'stockData');
                assert.isArray(res.body.stockData);
                assert.property(res.body.stockData[0], 'stock');
                assert.property(res.body.stockData[0], 'price');
                assert.property(res.body.stockData[0], 'rel_likes');
                assert.property(res.body.stockData[1], 'stock');
                assert.property(res.body.stockData[1], 'price');
                assert.property(res.body.stockData[1], 'rel_likes');
                done();
            }).timeout(5000);
    });
});