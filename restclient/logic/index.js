const Krisflyer = require('./krisflyer');
const Gopay = require('./gopay');

module.exports = {
	krisflyer: new Krisflyer(),
	gopay: new Gopay(),
};
