let connections = {}; // Временное хранилище

exports.handler = async (event) => {
  if (event.httpMethod === "POST") {
    const data = JSON.parse(event.body);

    if (data.type === "sdp") {
      const key = data.sdp.type === "offer" ? "offer" : "answer";
      connections[key] = data.sdp;
      
      if (connections.offer && connections.answer) {
        return {
          statusCode: 200,
          body: JSON.stringify({ offer: connections.offer, answer: connections.answer })
        };
      }
      
      return {
        statusCode: 200,
        body: JSON.stringify({ message: `SDP ${key} получен` })
      };
    }

    if (data.type === "ice") {
      if (!connections.ice) connections.ice = [];
      connections.ice.push(data.candidate);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "ICE-кандидат получен" })
      };
    }
  }

  return { statusCode: 405, body: "Метод не разрешен" };
};