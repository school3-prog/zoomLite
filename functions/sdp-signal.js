// functions/sdp-signal.js
const { parse } = require('querystring');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'POST') {
    const body = await new Promise((resolve, reject) => {
      let data = '';
      event.body.on('data', chunk => data += chunk);
      event.body.on('end', () => resolve(data));
    });

    const parsedBody = parse(body);
    const { sdp, iceCandidate } = parsedBody;

    // Здесь ты можешь обработать и отправить данные через WebSocket или другим способом.
    // Например, передача SDP или ICE-кандидатов в WebSocket

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Signal received" })
    };
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ message: "Method not allowed" })
  };
};