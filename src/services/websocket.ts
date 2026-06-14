class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private pingInterval: NodeJS.Timeout | null = null;
  private messageHandler: ((data: unknown) => void) | null = null;
  private groupId: number | null = null;
  private token: string | null = null;
  private shouldReconnect = true;
  private connectingPromise: Promise<void> | null = null;
  private resolveConnecting: (() => void) | null = null;
  private rejectConnecting: ((reason?: unknown) => void) | null = null;
  private wsUrlCandidates: string[] = [];
  private wsUrlIndex = 0;
  private isWebSocketAvailable = true;
  private pollingInterval: NodeJS.Timeout | null = null;

  connect(groupId: number, token: string): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN && this.groupId === groupId) {
      return Promise.resolve();
    }

    if (this.groupId !== groupId) {
      this.shouldReconnect = false;
      this.cleanupConnectingPromise();
      if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
        this.ws.close(1000, 'Смена чата');
      }
      this.ws = null;
      this.stopPing();
      this.stopPolling();
      this.shouldReconnect = true;
    }

    this.groupId = groupId;
    this.token = token;
    this.shouldReconnect = true;

    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      process.env.NEXT_PUBLIC_CHAT_API?.replace('http', 'ws') ||
      'ws://13.53.67.23:8000';

    this.wsUrlCandidates = [
      `${wsUrl}/ws/messages?token=${token}&group_id=${groupId}`,
    ];
    this.wsUrlIndex = 0;

    console.log('[WebSocket] Connecting to:', this.wsUrlCandidates[0]);
    console.log('[WebSocket] Token length:', token.length);
    console.log('[WebSocket] Group ID:', groupId);

    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      this.ws.close();
      this.ws = null;
    }

    if (this.connectingPromise) {
      return this.connectingPromise;
    }

    this.connectingPromise = new Promise((resolve, reject) => {
      this.resolveConnecting = resolve;
      this.rejectConnecting = reject;

      const tryConnect = () => {
        if (!this.shouldReconnect) {
          return;
        }

        const wsUrl = this.wsUrlCandidates[this.wsUrlIndex];

        try {
          this.ws = new WebSocket(wsUrl);

          const connectionTimeout = setTimeout(() => {
            if (this.ws?.readyState === WebSocket.CONNECTING) {
              this.ws.close();
            }
          }, 3000);

          this.ws.onopen = () => {
            clearTimeout(connectionTimeout);
            console.log('[WebSocket] Connected successfully');
            this.reconnectAttempts = 0;
            this.isWebSocketAvailable = true;
            this.startPing();
            this.resolveConnecting?.();
            this.cleanupConnectingPromise();
          };

          // FIX 1: извлекаем полезную информацию из Event объекта
          this.ws.onerror = (error: Event) => {
            const target = error.target as WebSocket | null;
            console.warn('[WebSocket] Connection error (will fallback to HTTP):', {
              type: error.type,
              url: target?.url ?? 'unknown',
              readyState: target?.readyState ?? 'unknown',
            });

            if (this.ws?.readyState === WebSocket.CONNECTING) {
              this.wsUrlIndex++;
              if (this.wsUrlIndex < this.wsUrlCandidates.length) {
                setTimeout(() => tryConnect(), 500);
                return;
              }
            }
          };

          this.ws.onclose = (event) => {
            console.log('[WebSocket] Closed:', {
              code: event.code,
              reason: event.reason,
              wasClean: event.wasClean,
            });

            this.stopPing();

            if (this.connectingPromise) {
              if (this.wsUrlIndex < this.wsUrlCandidates.length - 1) {
                this.wsUrlIndex++;
                setTimeout(() => tryConnect(), 300);
              } else {
                console.log('[WebSocket] Falling back to HTTP polling');
                this.isWebSocketAvailable = false;
                this.startPolling();
                this.resolveConnecting?.();
                this.cleanupConnectingPromise();
                if (this.messageHandler) {
                  this.messageHandler({
                    type: 'connection_status',
                    status: 'connected_via_http',
                    message: 'Подключено через HTTP API',
                  });
                }
              }
            }

            if (this.shouldReconnect && event.code !== 1000) {
              this.handleReconnect();
            }
          };

          this.ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              console.log('[WebSocket] Received message:', data);
              this.messageHandler?.(data);
            } catch (error) {
              console.error('[WebSocket] Error parsing message:', error);
            }
          };
        } catch (error) {
          if (this.wsUrlIndex < this.wsUrlCandidates.length - 1) {
            this.wsUrlIndex += 1;
            setTimeout(tryConnect, 500);
            return;
          }

          this.rejectConnecting?.(error);
          this.cleanupConnectingPromise();
        }
      };

      tryConnect();
    });

    return this.connectingPromise;
  }

  private cleanupConnectingPromise() {
    this.connectingPromise = null;
    this.resolveConnecting = null;
    this.rejectConnecting = null;
  }

  private handleReconnect() {
    if (this.reconnectAttempts < 5 && this.groupId && this.token) {
      this.reconnectAttempts++;

      setTimeout(() => {
        if (this.shouldReconnect) {
          this.connect(this.groupId!, this.token!).catch((err) => {
            console.error('[WebSocket] Reconnect failed:', err);
          });
        }
      }, 3000);
    } else {
      if (!this.isWebSocketAvailable) {
        this.startPolling();
      }
    }
  }

  private startPing() {
    return;
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  sendMessage(message: unknown): void {
    const readyState = this.ws?.readyState;

    console.log('[WebSocket] sendMessage called. ReadyState:', readyState, 'Message:', message);

    // Служебные сообщения с полем 'action' отправляем только через WebSocket
    if (message && typeof message === 'object' && message !== null && 'action' in message) {
      if (readyState === WebSocket.OPEN) {
        try {
          console.log('[WebSocket] Sending action via WebSocket:', message);
          this.ws!.send(JSON.stringify(message));
        } catch (error) {
          console.error('[WebSocket] Send error for action:', error);
        }
      } else if (readyState === WebSocket.CONNECTING) {
        console.log('[WebSocket] Still connecting, will retry action in 1s');
        setTimeout(() => {
          this.sendMessage(message);
        }, 1000);
      } else {
        console.log('[WebSocket] Not connected, skipping action message (WS only)');
      }
      return;
    }

    if (message && typeof message === 'object' && message !== null && 'group_id' in message) {
      const messageGroupId = (message as { group_id?: number }).group_id;
      if (messageGroupId !== undefined && messageGroupId !== this.groupId) {
        console.log('[WebSocket] Message group_id mismatch, skipping');
        return;
      }
    }

    if (readyState === WebSocket.OPEN) {
      try {
        console.log('[WebSocket] Sending via WebSocket');
        this.ws!.send(JSON.stringify(message));
      } catch (error) {
        console.error('[WebSocket] Send error, falling back to HTTP:', error);
        this.sendMessageViaHTTP(message);
      }
    } else if (readyState === WebSocket.CONNECTING) {
      console.log('[WebSocket] Still connecting, will retry in 1s');
      setTimeout(() => {
        this.sendMessage(message);
      }, 1000);
    } else {
      console.log('[WebSocket] Not connected, using HTTP fallback');
      this.sendMessageViaHTTP(message);
    }
  }

  // FIX 2: очищаем payload от внутренних WS-полей перед отправкой в REST API
  private async sendMessageViaHTTP(message: unknown): Promise<void> {
    try {
      console.log('[WebSocket] Sending via HTTP:', message);

      const raw = message as {
        text?: string;
        file?: File;
        file_url?: string;
        attachments?: unknown[];
        // внутренние WS-поля — не передаём в REST
        group_id?: unknown;
        type?: unknown;
        [key: string]: unknown;
      };

      console.log('[WebSocket] Raw message fields:', {
        hasText: !!raw.text,
        textValue: raw.text,
        textLength: raw.text?.length,
        hasFileUrl: !!raw.file_url,
        hasFile: !!raw.file,
        hasAttachments: !!raw.attachments,
      });

      // Только поля, которые принимает REST API
      const restPayload: Record<string, unknown> = {};
      if (raw.text && raw.text.trim() !== '') {
        restPayload.text = raw.text;
      }
      if (raw.file_url) restPayload.file_url = raw.file_url;
      if (raw.attachments) restPayload.attachments = raw.attachments;

      console.log('[WebSocket] Rest payload:', restPayload);

      // Если payload пустой, логируем ошибку и не отправляем
      if (Object.keys(restPayload).length === 0) {
        console.error('[WebSocket] Cannot send message: no valid fields (text or file required)');
        return;
      }

      const baseUrl = `${process.env.NEXT_PUBLIC_CHAT_API}/groups/${this.groupId}/messages`;
      const authHeader = { Authorization: `Bearer ${this.token}` };

      if (raw.attachments && raw.attachments.length > 0) {
        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: { ...authHeader, 'Content-Type': 'application/json' },
          body: JSON.stringify(restPayload),
        });

        console.log('[WebSocket] HTTP response (attachments):', response.status, response.statusText);
        if (!response.ok) {
          const body = await response.text().catch(() => '');
          console.error('[WebSocket] HTTP error (attachments):', response.status, response.statusText, body);
        }
        return;
      }

      if (raw.file_url || raw.file) {
        const formData = new FormData();
        if (raw.text) formData.append('text', raw.text);
        if (raw.file) formData.append('file', raw.file);
        if (raw.file_url) formData.append('file_url', raw.file_url);

        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: authHeader,
          body: formData,
        });

        console.log('[WebSocket] HTTP response (file):', response.status, response.statusText);
        if (!response.ok) {
          const body = await response.text().catch(() => '');
          console.error('[WebSocket] HTTP error (file):', response.status, response.statusText, body);
        }
        return;
      }

      // Обычное текстовое сообщение - используем FormData как в RTK Query
      const formData = new FormData();
      if (raw.text) formData.append('text', raw.text);

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: authHeader,
        body: formData,
      });

      console.log('[WebSocket] HTTP response (text):', response.status, response.statusText);
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        console.error('[WebSocket] HTTP error (text):', response.status, response.statusText, body);
      }
    } catch (error) {
      console.error('[WebSocket] HTTP send error:', error);
    }
  }

  setMessageHandler(handler: (data: unknown) => void) {
    this.messageHandler = handler;
  }

  disconnect() {
    this.shouldReconnect = false;
    this.stopPing();
    this.stopPolling();
    this.messageHandler = null;
    this.groupId = null;
    this.token = null;

    this.connectingPromise = null;
    this.resolveConnecting = null;
    this.rejectConnecting = null;

    if (this.ws) {
      this.ws.close(1000, 'Закрыто клиентом');
      this.ws = null;
    }
  }

  private startPolling(): void {
    if (this.pollingInterval) return;

    this.pollingInterval = setInterval(async () => {
      if (this.groupId && this.token) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_CHAT_API}/groups/${this.groupId}/messages`,
            { headers: { Authorization: `Bearer ${this.token}` } }
          );

          if (response.ok) {
            const data = await response.json();
            this.messageHandler?.(data);
          } else {
            console.error('[WebSocket] Polling error:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('[WebSocket] Polling fetch error:', error);
        }
      }
    }, 5000);
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  getReadyState(): number | undefined {
    return this.ws?.readyState;
  }

  isConnected(): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return true;
    }
    if (!this.isWebSocketAvailable && this.groupId && this.token) {
      return true;
    }
    return false;
  }

  isWebSocketEnabled(): boolean {
    return this.isWebSocketAvailable;
  }
}

export const wsManager = new WebSocketManager();