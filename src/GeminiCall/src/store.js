import { create } from 'zustand';
import { AudioRecorder } from './lib/audio-recorder';

const useCallStore = create((set, get) => ({
  // 状态和方法初始化
  activeMode: 'voice',  //包括voice,video,还有screen
  isConnected: false,
  isMuted: false,
  isVideoOn: false,
  isSpeakerOn: true,
  isScreenOn: false,
  callDuration: '00:00:00',
  config: {
    url: '',
    apiKey: ''
  },
  timer: null, // 定时器引用
  audioRecorder: new AudioRecorder(),
  screenStream: null, //用于共享桌面的视频流显示
  videoRef: null,
  renderCanvasRef: null,
  LiveAPIState: null,
  liveAPIConfig: null,
  liveAPIClient: null,
  liveAPIVolume: 0,
  // 更新状态的方法
  setActiveMode: (mode) => set({ activeMode: mode }),
  setIsMuted: (muted) => set({ isMuted: muted }),
  setIsVideoOn: (on) => set({ isVideoOn: on }),
  setIsSpeakerOn: (on) => set({ isSpeakerOn: on }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  setIsScreenOn: (on) => set({ isScreenOn: on }),
  setCallDuration: (duration) => set({ callDuration: duration }),
  setVolume: (volume) => set({ liveAPIVolume: volume }), // 设置liveAPIVolume
  setVideoRef: (ref) => set({ videoRef: ref }),
  setRenderCanvasRef: (ref) => set({ renderCanvasRef: ref }),
  setLiveAPIState: (state) => {
    set({ LiveAPIState: state });
    set({ liveAPIConfig: state.config, liveAPIClient: state.client, liveAPIVolume: state.volume });
  },
  // LiveAPI 操作方法
  setConfig: (newConfig) => {
    set({ config: newConfig });
  },
  setTimer: (timer) => set({ timer }),

  connect: async () => {
    const { LiveAPIState } = get();
    console.log('触发了connect')
    if (!LiveAPIState) {
      console.warn('LiveAPIState 未初始化，正在尝试连接...');
      set({ isConnected: false }); // 临时设置连接状态
      return;
    }
    try {
      await LiveAPIState.connect();
      set({ isConnected: true, liveAPIClient: LiveAPIState.client });
    } catch (error) {
      console.error('连接失败:', error);
      set({ isConnected: false });
    }
  },

  disconnect: async () => {
    const { LiveAPIState } = get();
    console.log('触发了disconnect Websocket')
    if (!LiveAPIState) {
      set({ isConnected: false });
      return;
    }
    try {
      await LiveAPIState.disconnect();
      set({ isConnected: false});
    } catch (error) {
      console.error('断开连接失败:', error);
    }
  },
  toggleMute: () => {
    const { muted } = get();
    LiveAPIState.setMuted(!muted);
    set({ muted: !muted });
  },

  handleConnect: async (mode) => {
    const store = get();
    await store.connect();
    store.startTimer(); // 启动定时器
    if (mode === 'voice') {
      store.startAudioRecording();
    } else if (mode === 'video') {
      store.startAudioRecording();
      store.setIsVideoOn(true); // 设置视频为开启状态的bool值
    } else if (mode === 'screen') {
      store.startAudioRecording();
      store.setIsScreenOn(true); // 设置屏幕共享开启状态的bool值
    }
  },

  handleDisconnect: async (mode) => {
    const store = get();
    store.setIsConnected(false);
    store.stopTimer(); // 停止定时器    
    try {
      store.stopAudioRecording();
      // Wait a small amount of time for cleanup
      await new Promise(resolve => setTimeout(resolve, 50));
      //停止视频流
      if (mode === 'video') {
        store.setIsVideoOn(false);
      } else if (mode === 'screen') {
        store.setIsScreenOn(false);
      }
      // Then disconnect the WebSocket
      if (store.LiveAPIState) {
        await store.disconnect();
      }
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  },

  // 处理音频录制
  startAudioRecording: () => {
    const { audioRecorder, liveAPIClient, isConnected, isMuted } = get();
    if (isConnected && !isMuted && audioRecorder) {
      audioRecorder
        .on('data', (base64) => {
          liveAPIClient.sendRealtimeInput([
            {
              mimeType: "audio/pcm;rate=16000",
              data: base64,
            },
          ]);
        })
        .on('volume', get().setVolume)
        .start();
    }
  },

  stopAudioRecording: () => {
    const { audioRecorder } = get();
    audioRecorder.off('data'); // 移除旧的监听器
    audioRecorder.off('volume'); // 移除旧的监听器
    audioRecorder.stop();
  },

  // 计时器方法
  startTimer: () => {
    let seconds = 0;
    const timer = setInterval(() => {
      seconds++;
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      set({
        callDuration: `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`,
      });
    }, 1000);
    set({ timer });
  },

  stopTimer: () => {
    const { timer } = get();
    if (timer) {
      clearInterval(timer);
      set({ timer: null, callDuration: '00:00:00' });
    }
  },

  // 初始化 LiveAPIState 的方法
  initLiveAPIState: (LiveAPIStateInstance) => set({ LiveAPIState: LiveAPIStateInstance }),
}));
export { useCallStore };
