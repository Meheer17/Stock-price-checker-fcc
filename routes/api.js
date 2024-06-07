'use strict';

const clidb = require('../public/db.js')
function apis(arg) {
	return `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${arg}/quote`
}

module.exports = function (app) {
	app.route('/api/stock-prices')
		.get(async function (req, res) {
			const db = await clidb()
			if (!(req.query.stock instanceof Array)) {
				const data = await fetch(apis(req.query.stock), { method: "GET" })
					.then(response => response.json())
					.then( async data => {
						if (data == "Unknown symbol") {
							return { error: "Unknown symbol" }
						}
						if (req.query.like == "true") {
							const content = await db.collection('stock').find({ name: data.symbol }).toArray()
							if ((await content).length != 0) {
								if (!content[0].ips.includes(req.ip)){
									console.log("HIO")
									await db.collection('stock').updateOne({ name: data.symbol }, { $inc: { likes: 1 }, $push: { ips: req.ip } })
								}
							} else {
								await db.collection('stock').insertOne({ name: data.symbol, likes: 1, ips: [req.ip] })
							}
							const likes = await db.collection('stock').find({ name: data.symbol }).project({likes: 1}).toArray()
							return { stock: data.symbol, price: parseFloat(data.latestPrice), likes: parseInt(likes[0].likes) }
						} else {
							return { stock: data.symbol, price: parseFloat(data.latestPrice) }
						}
					})
				res.json({ stockData: await data })

			} else {
				const data = await fetch(apis(req.query.stock[0]), { method: "GET" })
					.then(response => response.json())
					.then(async data => {
						if (data == "Unknown symbol") {
							return { stock: req.query.stock[0], error: "Unknown symbol" }
						}
						const content = await db.collection('stock').find({ name: data.symbol }).toArray()
						if ((await content).length != 0) {
							if (!content[0].ips.includes(req.ip)) {
								console.log("HIO")
								await db.collection('stock').updateOne({ name: data.symbol }, { $inc: { likes: 1 }, $push: { ips: req.ip } })
							}
						} else {
							await db.collection('stock').insertOne({ name: data.symbol, likes: 1, ips: [req.ip] })
						}
						const likes = await db.collection('stock').find({ name: data.symbol }).project({ likes: 1 }).toArray()
						return { stock: data.symbol, price: data.latestPrice, likes: parseInt(likes[0].likes) }
					})
				const data2 = await fetch(apis(req.query.stock[1]), { method: "GET" })
					.then(response => response.json())
					.then(async data => {
						if (data == "Unknown symbol") {
							return { stock: req.query.stock[0], error: "Unknown symbol" }
						}
						const content = await db.collection('stock').find({ name: data.symbol }).toArray()
						if ((await content).length != 0) {
							if (!content[0].ips.includes(req.ip)) {
								console.log("HIO")
								await db.collection('stock').updateOne({ name: data.symbol }, { $inc: { likes: 1 }, $push: { ips: req.ip } })
							}
						} else {
							await db.collection('stock').insertOne({ name: data.symbol, likes: 1, ips: [req.ip] })
						}
						const likes = await db.collection('stock').find({ name: data.symbol }).project({ likes: 1 }).toArray()
						return { stock: data.symbol, price: data.latestPrice, likes: parseInt(likes[0].likes) }

					})
				await data
				await data2
				res.json({ stockData: [{ stock: data.stock, price: parseFloat(data.price), error: data.error, rel_like: data.likes - data2.likes }, { stock: data2.stock, price: parseFloat(data2.price), error: data2.error, rel_like: data2.likes - data.likes }] })
			}
		});

};
