
const model = require('../../models');
const { Response } = require('../../helper/response');

const WebView = model.WebView.Get;

exports.getWebviewContent = async () => {
	const webView = await WebView.findAll();
	return new Response(20038, webView);
};
