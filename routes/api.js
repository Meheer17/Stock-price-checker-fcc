'use strict';

const clidb = require('../public/db.js')
function apis(arg) {
	return `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${arg}/quote`
}

module.exports = function (app) {
	app.route('/api/stock-prices')
		.get(async function (req, res) {
			const db = await clidb()
			// console.log((await (await fetch(apis(req.query.stock), { method: "GET" })).json()))
			if (!(req.query.stock instanceof Array)) {
				const dataPromise = fetch(apis(req.query.stock), { method: "GET" })
					.then(response => response.json())

				const contentPromise = dataPromise.then(data => {
					if (data == "Unknown symbol") {
						return { error: "Unknown symbol" }
					}
					return db.collection('stock').find({ name: data.symbol }).toArray()
				})

				const [data, content] = await Promise.all([dataPromise, contentPromise])

				let result;
				if (req.query.like == "true") {
					if (content.length != 0) {
						if (!content[0].ips.includes(req.ip)) {
							await db.collection('stock').updateOne({ name: data.symbol }, { $inc: { likes: 1 }, $push: { ips: req.ip } })
						}
					} else {
						await db.collection('stock').insertOne({ name: data.symbol, likes: 1, ips: [req.ip] })
					}
					const likes = await db.collection('stock').find({ name: data.symbol }).project({ likes: 1 }).toArray()
					result = { stock: data.symbol.toString(), price: parseInt(data.latestPrice), likes: parseInt(likes[0].likes) }
				} else {
					result = { stock: data.symbol.toString(), price: parseInt(data.latestPrice), likes: parseInt(content[0].likes) }
				}
				res.json({ stockData: result })
			} else {
				
				const dataPromise = fetch(apis(req.query.stock[0]), { method: "GET" }).then(response => response.json())
				const dataPromise2 = fetch(apis(req.query.stock[1]), { method: "GET" }).then(response => response.json())
				const contentPromise = dataPromise.then(data => {
					if (data == "Unknown symbol") {
						return { error: "Unknown symbol" }
					}
					return db.collection('stock').find({ name: data.symbol }).toArray()
				})
				const contentPromise2 = dataPromise2.then(data => {
					if (data == "Unknown symbol") {
						return { error: "Unknown symbol" }
					}
					return db.collection('stock').find({ name: data.symbol }).toArray()
				})

				const [data, data2, content, content2] = await Promise.all([dataPromise, dataPromise2, contentPromise, contentPromise2])

				if (req.query.like == "true") {
					if (content.length != 0) {
						if (!content[0].ips.includes(req.ip)) {
							await db.collection('stock').updateOne({ name: data.symbol }, { $inc: { likes: 1 }, $push: { ips: req.ip } })
						}
					}
					else {
						await db.collection('stock').insertOne({ name: data.symbol, likes: 1, ips: [req.ip] })
					}
					if (content2.length != 0) {
						if (!content2[0].ips.includes(req.ip)) {
							await db.collection('stock').updateOne({
								name: data2.symbol
							}, { $inc: { likes: 1 }, $push: { ips: req.ip } })
						}
					}
					else {
						await db.collection('stock').insertOne({ name: data2.symbol, likes: 1, ips: [req.ip] })
					}
				}
				const likes = await db.collection('stock').find({ name: data.symbol }).project({ likes: 1 }).toArray()
				const likes2 = await db.collection('stock').find({ name: data2.symbol }).project({ likes: 1 }).toArray()
				
				res.json({ stockData: [{ stock: data.symbol.toString(), price: parseFloat(data.price), error: data.error, rel_likes: likes - likes2 }, { stock: data.symbol.toString(), price: parseFloat(data2.price), error: data2.error, rel_likes: likes - likes2 }] })
			}
		});

};
