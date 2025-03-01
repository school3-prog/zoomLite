const startButton = document.getElementById("start-call");
const sdpField = document.getElementById("sdp");
const remoteSdpField = document.getElementById("remote-sdp");
const acceptButton = document.getElementById("accept-call");
let peerConnection;
const config = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};


startButton.addEventListener("click", async () => {
  console.log("Создаю RTCPeerConnection...");
  peerConnection = new RTCPeerConnection(config);
  console.log("RTCPeerConnection создан:", peerConnection);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("Новый ICE-кандидат:", event.candidate);
      sendSignal({ type: "ice", candidate: event.candidate });
    }
  };

  console.log("Запрашиваю доступ к камере и микрофону...");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    console.log("Камера и микрофон получены!", stream);

    // Включаем видео
    const videoElement = document.getElementById("localVideo");
    videoElement.srcObject = stream;
    videoElement.play();

  } catch (error) {
    console.error("Ошибка доступа к камере/микрофону:", error);
  }

  console.log("Создаю SDP Offer...");
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  console.log("SDP Offer создан:", offer);

  // Сразу добавляем в поле SDP
  console.log("Ваш SDP (немедленный вывод):", peerConnection.localDescription.sdp);
  sdpField.value = peerConnection.localDescription.sdp;
  sendSignal({ type: "sdp", sdp: peerConnection.localDescription });

  peerConnection.onicegatheringstatechange = () => {
    if (peerConnection.iceGatheringState === "complete") {
      console.log("Ваш SDP (ICE-кандидаты завершены):", peerConnection.localDescription.sdp);
      sdpField.value = peerConnection.localDescription.sdp;
      sendSignal({ type: "sdp", sdp: peerConnection.localDescription });
    }
  };
});

acceptButton.addEventListener("click", async () => {
  const remoteSDP = remoteSdpField.value;
  if (!peerConnection) {
    peerConnection = new RTCPeerConnection(config);
  }
  
  await peerConnection.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: remoteSDP }));

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  sendSignal({ type: "sdp", sdp: peerConnection.localDescription });

  console.log("Отправлен ответ SDP:", answer.sdp);
});

// Функция отправки SDP на сервер Netlify
function sendSignal(data) {
  fetch("/.netlify/functions/sdp-signal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then((response) => response.json())
    .then((data) => console.log("Ответ сервера:", data))
    .catch((error) => console.error("Ошибка отправки SDP:", error));
}