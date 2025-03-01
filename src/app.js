document.getElementById("start-call").addEventListener("click", () => {
    // Логика для инициализации WebRTC
    const sdp = "example SDP data"; // Получаем SDP
    document.getElementById("sdp").value = sdp;
  
    // Отправка данных через POST-запрос к функции Netlify
    fetch('/.netlify/functions/sdp-signal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `sdp=${encodeURIComponent(sdp)}`
    })
    .then(response => response.json())
    .then(data => console.log('Signal sent:', data));
  });