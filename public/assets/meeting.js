const socket = io("/");
const videoGrid = document.getElementById("video-grid");
let myPeer;
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};
const userName = "User" + Math.floor(Math.random() * 1000);

// --- CONFIGURACIÓN PEERJS ---
const peerConfig = {
    host: window.location.hostname,
    port: window.location.port,
    path: '/peerjs',
    config: {
        iceServers: typeof ICE_SERVERS !== 'undefined' ? ICE_SERVERS : [{ urls: 'stun:stun.l.google.com:19302' }]
    }
};

// --- INICIALIZACIÓN ---
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myPeer = new Peer(undefined, peerConfig);
  addVideoStream(myVideo, stream);

  myPeer.on("call", call => {
    call.answer(stream);
    const video = document.createElement("video");
    call.on("stream", userVideoStream => addVideoStream(video, userVideoStream));
  });

  socket.on("user-connected", userId => connectToNewUser(userId, stream));
  
  myPeer.on("open", id => socket.emit("join-meeting", MEETING_ID, id));

  // Botones Mute/Video
  document.getElementById('mute-btn').addEventListener('click', () => {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      document.getElementById('mute-btn').innerText = audioTrack.enabled ? "🎙️ Mute" : "🎙️ Unmute";
  });
  document.getElementById('video-btn').addEventListener('click', () => {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      document.getElementById('video-btn').innerText = videoTrack.enabled ? "📹 Video" : "📹 No Video";
  });

}).catch(err => console.error("Stream error:", err));

socket.on("user-disconnected", userId => {
  if (peers[userId]) peers[userId].close();
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", userVideoStream => addVideoStream(video, userVideoStream));
  call.on("close", () => video.remove());
  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => video.play());
  videoGrid.append(video);
}

// --- CHAT Y ARCHIVOS ---
const chatForm = document.getElementById("chat-form");
if (chatForm) {
    chatForm.addEventListener("submit", e => {
        e.preventDefault();
        const input = document.getElementById("chat-input");
        if(input.value) {
            socket.emit("message", { message: input.value, userName });
            input.value = "";
        }
    });
}

socket.on("message", data => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${data.userName}:</strong> ${data.message}`;
    document.getElementById("chat-messages").appendChild(div);
});

socket.on('file-uploaded', (fileData) => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>Sistema:</strong> Archivo compartido <a href="${fileData.url}" target="_blank">📥 ${fileData.originalName}</a>`;
    document.getElementById("chat-messages").appendChild(div);
});

// --- LÓGICA DE AGENDA (SOLO PRO) ---
if (typeof IS_PRO !== 'undefined' && IS_PRO) {
    let agendaTimerInterval;

    // Cargar Agenda Inicial
    fetch(`/meetings/${MEETING_ID}/agenda`)
        .then(res => res.json())
        .then(data => {
            renderAgendaList(data.items);
            // Si hay un item activo, iniciar timer
            const activeItem = data.items.find(i => i.status === 'active');
            if (activeItem && activeItem.actualStartTime) {
                startLocalTimer(activeItem, activeItem.actualStartTime);
                updateActiveDisplay(activeItem);
            }
        });

    function renderAgendaList(items) {
        const list = document.getElementById("agenda-list");
        list.innerHTML = "";
        items.forEach(item => {
            const div = document.createElement("div");
            div.style.padding = "8px";
            div.style.borderBottom = "1px solid #eee";
            div.style.background = item.status === 'active' ? '#e7f5ff' : (item.status === 'completed' ? '#f8f9fa' : 'white');
            div.style.color = item.status === 'completed' ? '#999' : 'black';
            div.innerHTML = `
                <div style="font-weight: bold;">${item.topic}</div>
                <div style="font-size: 0.8rem;">${item.durationInMinutes} min - <span style="text-transform: capitalize;">${item.status}</span></div>
            `;
            list.appendChild(div);
        });
        // Actualizar referencia global
        window.agendaItems = items;
    }

    // SOCKET: Actualización de Agenda
    socket.on("agenda-update", (data) => {
        // data: { currentItem, startTime, duration }
        updateActiveDisplay(data.currentItem);
        startLocalTimer(data.currentItem, data.startTime);
        
        // Recargar lista completa para ver estados
        fetch(`/meetings/${MEETING_ID}/agenda`)
            .then(res => res.json())
            .then(d => renderAgendaList(d.items));
    });

    socket.on("agenda-finished", () => {
        clearInterval(agendaTimerInterval);
        document.getElementById("active-agenda-display").style.display = "none";
        alert("La agenda ha finalizado.");
    });

    function updateActiveDisplay(item) {
        document.getElementById("active-agenda-display").style.display = "block";
        document.getElementById("current-topic").innerText = item.topic;
    }

    function startLocalTimer(item, startTimeISO) {
        clearInterval(agendaTimerInterval);
        const startTime = new Date(startTimeISO).getTime();
        const durationMs = item.durationInMinutes * 60 * 1000;
        const endTime = startTime + durationMs;

        function tick() {
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance < 0) {
                document.getElementById("timer-countdown").innerText = "00:00 (Tiempo agotado)";
                document.getElementById("timer-countdown").style.color = "red";
                // No paramos el intervalo para mostrar que se excedió, o podríamos pararlo.
                return;
            }

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            document.getElementById("timer-countdown").innerText = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            document.getElementById("timer-countdown").style.color = "white";
        }

        tick(); // Ejecutar inmediatamente
        agendaTimerInterval = setInterval(tick, 1000);
    }

    // --- CONTROLES DE HOST ---
    if (typeof IS_HOST !== 'undefined' && IS_HOST) {
        
        document.getElementById("add-agenda-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const topic = document.getElementById("new-topic").value;
            const duration = document.getElementById("new-duration").value;
            const order = (window.agendaItems?.length || 0) + 1;

            await fetch(`/meetings/${MEETING_ID}/agenda/items`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ topic, durationInMinutes: duration, order })
            });
            // Recargar lista
            fetch(`/meetings/${MEETING_ID}/agenda`)
                .then(res => res.json())
                .then(d => renderAgendaList(d.items));
            
            document.getElementById("new-topic").value = "";
            document.getElementById("new-duration").value = "";
        });

        document.getElementById("btn-start-agenda").addEventListener("click", () => {
            // Buscar primer pendiente
            const pending = window.agendaItems.find(i => i.status === 'pending');
            if(pending) {
                socket.emit("agenda-start", { meetingId: MEETING_ID, firstItemId: pending._id });
            } else {
                alert("No hay temas pendientes.");
            }
        });

        document.getElementById("btn-next-item").addEventListener("click", () => {
            const current = window.agendaItems.find(i => i.status === 'active');
            const next = window.agendaItems.find(i => i.status === 'pending');
            
            if(next) {
                socket.emit("agenda-next", { 
                    currentItemId: current ? current._id : null, 
                    nextItemId: next._id 
                });
            } else {
                if(current) socket.emit("agenda-stop", { currentItemId: current._id }); // Terminar último
                alert("Fin de la agenda.");
            }
        });
    }
}