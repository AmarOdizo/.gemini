import supabase from '../supabaseClient';

export class WebRTCManager {
  constructor(callId, isInitiator, onRemoteStream, onIceConnectionStateChange) {
    this.callId = callId;
    this.isInitiator = isInitiator;
    this.onRemoteStream = onRemoteStream;
    this.onIceConnectionStateChange = onIceConnectionStateChange;
    this.localStream = null;
    this.peerConnection = null;
    this.channel = null;
    this.iceCandidateQueue = [];

    // Configuration with public Google STUN server
    this.configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
      ]
    };
  }

  async initialize(localStream) {
    this.localStream = localStream;
    this.peerConnection = new RTCPeerConnection(this.configuration);

    // Add local tracks to peer connection
    this.localStream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    // Handle incoming remote stream
    this.peerConnection.ontrack = (event) => {
      if (this.onRemoteStream) {
        this.onRemoteStream(event.streams[0]);
      }
    };

    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      if (this.onIceConnectionStateChange) {
        this.onIceConnectionStateChange(this.peerConnection.iceConnectionState);
      }
    };

    // Set up Supabase Realtime channel for signaling
    this.channel = supabase.channel(`video-call-${this.callId}`);

    // Listen for signaling messages
    this.channel
      .on('broadcast', { event: 'signal' }, (payload) => {
        this.handleSignalingData(payload.payload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          if (!this.isInitiator) {
            this.sendSignalingData({ type: 'peer-joined' });
          } else {
            this.sendSignalingData({ type: 'initiator-waiting' });
          }
        }
      });

    // Send local ICE candidates to the remote peer
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingData({
          type: 'ice-candidate',
          candidate: event.candidate
        });
      }
    };
  }

  sendSignalingData(data) {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'signal',
        payload: data
      });
    }
  }

  async handleSignalingData(data) {
    try {
      if (data.type === 'peer-joined' && this.isInitiator) {
        this.createOffer();
      } else if (data.type === 'initiator-waiting' && !this.isInitiator) {
        this.sendSignalingData({ type: 'peer-joined' });
      } else if (data.type === 'offer' && !this.isInitiator) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        await this.processIceCandidateQueue();
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        this.sendSignalingData({
          type: 'answer',
          answer: answer
        });
      } else if (data.type === 'answer' && this.isInitiator) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        await this.processIceCandidateQueue();
      } else if (data.type === 'ice-candidate') {
        if (this.peerConnection.remoteDescription) {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        } else {
          this.iceCandidateQueue.push(data.candidate);
        }
      } else if (data.type === 'end-call') {
        this.endCall(false); // End call without broadcasting since we received it
      }
    } catch (error) {
      console.error("Error handling signaling data:", error);
    }
  }

  async processIceCandidateQueue() {
    for (const candidate of this.iceCandidateQueue) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Error adding queued ICE candidate:", e);
      }
    }
    this.iceCandidateQueue = [];
  }

  async createOffer() {
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      this.sendSignalingData({
        type: 'offer',
        offer: offer
      });
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  }

  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  endCall(broadcast = true) {
    if (broadcast) {
      this.sendSignalingData({ type: 'end-call' });
    }
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}
