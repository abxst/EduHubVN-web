import SockJS from "sockjs-client";
import { CompatClient, Stomp } from "@stomp/stompjs";
import type { UserProfile } from "../types/UserProfile";

class WebSocketService {
  private client: CompatClient | null = null;
  private domain = "14.161.18.135";
  private BASE_URL = `http://${this.domain}:8880`;
  private currentUserProfile: UserProfile | null = null;

  connect(
    userProfile: UserProfile,
    onConnected?: () => void,
    onMessage?: (msg: string) => void,
  ) {
    // Kiểm tra nếu đã connected với cùng user profile thì không reconnect
    if (this.client && this.client.connected && 
        this.currentUserProfile?.id === userProfile.id) {
      console.log("✅ WebSocket already connected for this user");
      return;
    }

    // Disconnect existing connection if different user
    if (this.client && this.client.connected && 
        this.currentUserProfile?.id !== userProfile.id) {
      console.log("🔄 Disconnecting for different user");
      this.disconnect();
    }

    console.log("🔌 Attempting to connect WebSocket for user:", userProfile.id);

    const socket = new SockJS(`${this.BASE_URL}/ws`);
    this.client = Stomp.over(socket);
    this.currentUserProfile = userProfile;

    this.client.connect({}, () => {
      console.log("✅ WebSocket connected");

      this.client?.subscribe("/topic/messages", (message) => {
        if (onMessage && message.body) {
          onMessage(message.body);
        }
      });
      // Subscribe kênh cá nhân nếu có userProfile

      if (userProfile) {
        this.client?.subscribe(
          `/topic/${userProfile.role}/${userProfile.id}`,
          (message) => {
            if (onMessage && message.body) {
              onMessage(message.body);
            }
          },
        );
        this.client?.subscribe(`/topic/${userProfile.role}`, (message) => {
          if (onMessage && message.body) {
            onMessage(message.body);
          }
        });
      }

      if (onConnected) onConnected();
    });
  }

  send(destination: string, body: string) {
    if (this.client && this.client.connected) {
      this.client.send(destination, {}, body);
    }
  }

  disconnect() {
    if (this.client && this.client.connected) {
      this.client.disconnect(() => console.log("❌ Disconnected"));
      this.currentUserProfile = null;
    }
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUserProfile;
  }
}

export default new WebSocketService();
