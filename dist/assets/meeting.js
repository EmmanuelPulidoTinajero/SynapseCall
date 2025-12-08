const { meetingId: MEETING_ID, isHost: IS_HOST, isPro: IS_PRO, iceServers: ICE_SERVERS } = window.MEETING_DATA || {};

if (!MEETING_ID) {
    console.error("Critical: MEETING_DATA not found.");
    alert("Error de inicialización de la reunión.");
}

const socket = io("/");
const videoGrid = document.getElementById("video-grid");
let myPeer;
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};
const userName = "User" + Math.floor(Math.random() * 1000);

const peerConfig = {
    host: window.location.hostname,
    port: window.location.port,
    path: '/peerjs',
    config: {
        iceServers: ICE_SERVERS || [{ urls: 'stun:stun.l.google.com:19302' }]
    }
};

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

  document.getElementById('mute-btn').addEventListener('click', () => {
      const audioTrack = stream.getAudioTracks()[0];
      if(audioTrack) {
          audioTrack.enabled = !audioTrack.enabled;
          document.getElementById('mute-btn').innerText = audioTrack.enabled ? "🎙️ Mute" : "🎙️ Unmute";
      }
  });
  document.getElementById('video-btn').addEventListener('click', () => {
      const videoTrack = stream.getVideoTracks()[0];
      if(videoTrack) {
          videoTrack.enabled = !videoTrack.enabled;
          document.getElementById('video-btn').innerText = videoTrack.enabled ? "📹 Video" : "📹 No Video";
      }
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

const chatTabBtn = document.getElementById('tab-btn-chat');
const agendaTabBtn = document.getElementById('tab-btn-agenda');
const chatTab = document.getElementById('chat-tab');
const agendaTab = document.getElementById('agenda-tab');

function switchTab(tabName) {
    if (tabName === 'chat') {
        chatTab.style.display = 'flex';
        if (agendaTab) agendaTab.style.display = 'none';
        chatTabBtn.style.background = '#f0f0f0';
        if (agendaTabBtn) agendaTabBtn.style.background = 'white';
    } else {
        chatTab.style.display = 'none';
        if (agendaTab) agendaTab.style.display = 'flex';
        chatTabBtn.style.background = 'white';
        if (agendaTabBtn) agendaTabBtn.style.background = '#f0f0f0';
    }
}

if (chatTabBtn) chatTabBtn.addEventListener('click', () => switchTab('chat'));
if (agendaTabBtn) agendaTabBtn.addEventListener('click', () => switchTab('agenda'));

const toggleBtn = document.getElementById('toggle-agenda-btn');
if(toggleBtn){
    toggleBtn.addEventListener('click', () => {
        const panel = document.getElementById('side-panel');
        panel.style.display = (panel.style.display === 'none') ? 'flex' : 'none';
    });
}

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

const fileForm = document.getElementById("file-upload-form");
if (fileForm) {
    fileForm.addEventListener("submit", async (e) => {
        e.preventDefault(); 
        const fileInput = document.getElementById("file-input");
        const uploadButton = document.getElementById("upload-button");

        if (fileInput.files.length === 0) return;

        const formData = new FormData(fileForm);
        
        const originalText = uploadButton.innerText;
        uploadButton.innerText = "Subiendo...";
        uploadButton.disabled = true;

        try {
            const response = await fetch(fileForm.action, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                fileInput.value = ""; 
            } else {
                alert("Error al subir archivo");
            }
        } catch (error) {
            console.error("Error subiendo archivo:", error);
            alert("Error de conexión");
        } finally {
            uploadButton.innerText = originalText;
            uploadButton.disabled = false;
        }
    });
}

if (IS_PRO) {
    let agendaTimerInterval;
    let agendaItems = [];

    fetch(`/meetings/${MEETING_ID}/agenda`)
        .then(res => res.json())
        .then(data => {
            if(data.items) {
                renderAgendaList(data.items);
                const activeItem = data.items.find(i => i.status === 'active');
                if (activeItem && activeItem.actualStartTime) {
                    startLocalTimer(activeItem, activeItem.actualStartTime);
                    updateActiveDisplay(activeItem);
                }
            }
        });

    function renderAgendaList(items) {
        const list = document.getElementById("agenda-list");
        if (!list) return;
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
        agendaItems = items;
    }

    socket.on("agenda-update", (data) => {
        updateActiveDisplay(data.currentItem);
        startLocalTimer(data.currentItem, data.startTime);
        
        fetch(`/meetings/${MEETING_ID}/agenda`)
            .then(res => res.json())
            .then(d => renderAgendaList(d.items));
    });

    socket.on("agenda-finished", () => {
        clearInterval(agendaTimerInterval);
        const activeDisplay = document.getElementById("active-agenda-display");
        if(activeDisplay) activeDisplay.style.display = "none";
        alert("La agenda ha finalizado.");
    });

    function updateActiveDisplay(item) {
        const activeDisplay = document.getElementById("active-agenda-display");
        if(activeDisplay) {
            activeDisplay.style.display = "block";
            document.getElementById("current-topic").innerText = item.topic;
        }
    }

    function startLocalTimer(item, startTimeISO) {
        clearInterval(agendaTimerInterval);
        const startTime = new Date(startTimeISO).getTime();
        const durationMs = item.durationInMinutes * 60 * 1000;
        const endTime = startTime + durationMs;

        function tick() {
            const now = new Date().getTime();
            const distance = endTime - now;
            const timerEl = document.getElementById("timer-countdown");
            if(!timerEl) return;

            if (distance < 0) {
                timerEl.innerText = "00:00 (Tiempo agotado)";
                timerEl.style.color = "red";
                return;
            }

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            timerEl.innerText = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            timerEl.style.color = "white";
        }

        tick();
        agendaTimerInterval = setInterval(tick, 1000);
    }

    if (IS_HOST) {
        const addAgendaForm = document.getElementById("add-agenda-form");
        if(addAgendaForm) {
            addAgendaForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const topic = document.getElementById("new-topic").value;
                const duration = document.getElementById("new-duration").value;
                const order = (agendaItems?.length || 0) + 1;

                await fetch(`/meetings/${MEETING_ID}/agenda/items`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ topic, durationInMinutes: duration, order })
                });
                
                fetch(`/meetings/${MEETING_ID}/agenda`)
                    .then(res => res.json())
                    .then(d => renderAgendaList(d.items));
                
                document.getElementById("new-topic").value = "";
                document.getElementById("new-duration").value = "";
            });
        }

        const btnStart = document.getElementById("btn-start-agenda");
        if(btnStart) {
            btnStart.addEventListener("click", () => {
                const pending = agendaItems.find(i => i.status === 'pending');
                if(pending) {
                    socket.emit("agenda-start", { meetingId: MEETING_ID, firstItemId: pending._id });
                } else {
                    alert("No hay temas pendientes.");
                }
            });
        }

        const btnNext = document.getElementById("btn-next-item");
        if(btnNext) {
            btnNext.addEventListener("click", () => {
                const current = agendaItems.find(i => i.status === 'active');
                const next = agendaItems.find(i => i.status === 'pending');
                
                if(next) {
                    socket.emit("agenda-next", { 
                        currentItemId: current ? current._id : null, 
                        nextItemId: next._id 
                    });
                } else {
                    if(current) socket.emit("agenda-stop", { currentItemId: current._id });
                    alert("Fin de la agenda.");
                }
            });
        }
    }
}