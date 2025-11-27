const socket = io(window.location.origin, { secure: true });
const videoGrid = document.getElementById("video-grid");
let myPeer;
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};
//mensajes
const userName = "User" + Math.floor(Math.random() * 1000);//hardcodeado por ahora
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const createBreakoutRoomForm = document.getElementById('create-breakout-room-form');
const breakoutRoomsContainer = document.getElementById('breakout-rooms-container');

const peerConfig = {
    host: window.location.hostname,
    port: window.location.port,
    path: '/peerjs',
    config: {
        iceServers: typeof ICE_SERVERS !== 'undefined' && Array.isArray(ICE_SERVERS) && ICE_SERVERS.length > 0
            ? ICE_SERVERS
            : [{ urls: 'stun:stun.l.google.com:19302' }]
    }
};

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myPeer = new Peer(undefined, peerConfig);

  addVideoStream(myVideo, stream);

  myPeer.on("error", (err) => {
    console.error("PeerJS General Error:", err);
  });

  myPeer.on("call", call => {
    call.answer(stream);
    const video = document.createElement("video");
    call.on("stream", userVideoStream => {
      addVideoStream(video, userVideoStream);
    });
    call.on("error", (err) => {
      console.error("PeerJS Call Error (Receiver):", err);
    });
  })

  socket.on("user-connected", userId => {
    connectToNewUser(userId, stream)
  })

  myPeer.on("open", id => {
    socket.emit("join-meeting", MEETING_ID, id);
  });
  

}).catch(error => {
  console.error("Failed to get local stream:", error);
  alert("Error: Please check your camera/microphone permissions and ensure you are using HTTPS.");
});

socket.on("user-disconnected", userId => {
  if (peers[userId]) {
    peers[userId].close();
  }
})

function connectToNewUser (userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });
  call.on("error", (err) => {
      console.error("PeerJS Call Error (Caller):", err);
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

//Chat funcionalidad
if (chatForm && chatInput && chatMessages) {
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = chatInput.value;
    if(!message) return;

    socket.emit("message", {
      message: message, 
      userName: userName
    });
    chatInput.value = "";
  });
}

socket.on("message", (data) => {
  const { userName, message, breakoutRoomId } = data;
  const messageElement = document.createElement("div");
  messageElement.innerHTML = `<strong>${userName}:</strong> ${message}`;

  if (breakoutRoomId) {
    const breakoutRoomChat = document.querySelector(`.breakout-room[data-id="${breakoutRoomId}"] .breakout-room-chat-messages`);
    if (breakoutRoomChat) {
      breakoutRoomChat.appendChild(messageElement);
      breakoutRoomChat.scrollTop = breakoutRoomChat.scrollHeight;
    }
  } else {
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});
// Breakout Rooms
if (IS_HOST && createBreakoutRoomForm) {
    createBreakoutRoomForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const titleInput = document.getElementById('breakout-room-title');
        const title = titleInput.value;
        if (!title) return;

        try {
            const response = await fetch(`/meetings/${MEETING_ID}/breakout-rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title })
            });
            if (response.ok) {
                titleInput.value = '';
            }
        } catch (error) {
            console.error('Error creating breakout room:', error);
        }
    });
}

socket.on('breakout-room-created', (breakoutRoom) => {
    renderBreakoutRoom(breakoutRoom);
});

function renderBreakoutRoom(breakoutRoom) {
    const template = document.getElementById('breakout-room-template');
    const clone = template.content.cloneNode(true);
    const breakoutRoomElement = clone.querySelector('.breakout-room');
    breakoutRoomElement.dataset.id = breakoutRoom._id;
    clone.querySelector('.breakout-room-title').innerText = breakoutRoom.title;
    
    const joinBtn = clone.querySelector('.join-breakout-room-btn');
    const leaveBtn = clone.querySelector('.leave-breakout-room-btn');
    const chatContainer = clone.querySelector('.breakout-room-chat-container');

    joinBtn.addEventListener('click', () => {
        socket.emit('join-breakout-room', breakoutRoom._id);
        joinBtn.style.display = 'none';
        leaveBtn.style.display = 'inline';
        chatContainer.style.display = 'block';
    });

    leaveBtn.addEventListener('click', () => {
        socket.emit('leave-breakout-room', breakoutRoom._id);
        leaveBtn.style.display = 'none';
        joinBtn.style.display = 'inline';
        chatContainer.style.display = 'none';
    });

    const chatForm = clone.querySelector('.breakout-room-chat-form');
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = chatForm.querySelector('input');
        const message = input.value;
        if (!message) return;

        socket.emit('message', {
            message,
            userName,
            breakoutRoomId: breakoutRoom._id
        });
        input.value = '';
    });

    breakoutRoomsContainer.appendChild(clone);
}

socket.on('invited-to-breakout-room', ({ breakoutRoomId, title }) => {
    const join = confirm(`You have been invited to join the breakout room: ${title}. Do you want to join?`);
    if (join) {
        const joinBtn = document.querySelector(`.breakout-room[data-id="${breakoutRoomId}"] .join-breakout-room-btn`);
        if (joinBtn) {
            joinBtn.click();
        }
    }
});
