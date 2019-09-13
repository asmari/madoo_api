const convertionController = require('../../controller/version-1/convertionController');
const convertionSchema = require('../../schema/convertionSchema');

module.exports = async (fastify) => {
	fastify.get('/check', {
		...convertionSchema.checkConvertion,
		beforeHandler: [fastify.authenticate],
	}, convertionController.checkConvertionRate);

	fastify.post('/convert', {
		...convertionSchema.doConvertionSchema,
		beforeHandler: [fastify.authenticate],
	}, convertionController.doConvertionPoint);

	fastify.get('/list', {
		...convertionSchema.getConvertion,
		beforeHandler: [fastify.authenticate],
	}, convertionController.getConvertionRate);

	fastify.get('/destination', {
		...convertionSchema.getDestination,
		beforeHandler: [fastify.authenticate],
	}, convertionController.getConversionDestination);

	fastify.get('/source', {
		...convertionSchema.getSource,
		beforeHandler: [fastify.authenticate],
	}, convertionController.getConversionSource);

	fastify.get('/keyboard', {
		...convertionSchema.getConvertionKeyboard,
		beforeHandler: [fastify.authenticate],
	}, convertionController.getKeyboardFieldConversion);

	fastify.post('/trigger/status', {
		...convertionSchema.doTriggerStatus,
		beforeHandler: [fastify.authenticate],
	}, convertionController.doChangeStatus);
};
