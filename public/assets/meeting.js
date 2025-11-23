const socket = io("/");
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
  const { userName, message } = data;
  const messageElement = document.createElement("div");
  messageElement.innerHTML = `<strong>${userName}:</strong> ${message}`;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
