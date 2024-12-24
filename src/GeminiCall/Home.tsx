import React, { useEffect, useRef } from 'react';
import { useCallStore } from './src/store';
import VoiceCall from './VoiceCall';
import VideoCall from './VideoCall';
import ScreenCall from './ScreenCall';
import '@fortawesome/fontawesome-free/css/all.min.css';
import {useLiveAPI} from './src/hooks/use-live-api';
import { set } from 'lodash';


// 从环境变量中获取 Gemini API 密钥
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set REACT_APP_GEMINI_APIK_KEY in .env");
}
const uri = process.env.REACT_APP_GEMINI_URI as string;
if (!uri) {
  throw new Error("需要设置环境变量 REACT_APP_GEMINI_URI in .env");
}

const GeminiCall: React.FC = () => {
  // 从 store 获取所有状态和方法
  const { 
    config,
    liveAPIVolume,
    activeMode,
    setActiveMode,
    isMuted,
    setIsMuted,
    isSpeakerOn,
    setIsSpeakerOn,
    isConnected, // 添加这个状态
    setIsConnected, // 添加这个方法
    isVideoOn,
    setIsVideoOn,
    setConfig,
    connect, // 连接
    disconnect // 断开连接
  } = useCallStore();

  // 初始化配置
  useEffect(() => {
    setConfig({
      url: uri,
      apiKey: API_KEY,
    });
    //检查uri是否是可连通的，否则警告
  }, []); 


  return (
    <div className="relative w-full min-h-screen bg-gray-50">
      {/* Nav Bar */}
      <div className="fixed top-0 w-full bg-white shadow-sm z-50 px-4 h-12 flex items-center justify-between">
        <div className="text-gray-800 font-medium">
          {activeMode === 'voice' && '语音通话'}
          {activeMode === 'video' && '视频通话'}
          {activeMode === 'screen' && '共享桌面'}
        </div>
        <div className="flex items-center space-x-2">
          <i className="fas fa-signal text-green-500"></i>
          <span className="text-xs text-gray-600">信号良好</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-12 pb-16 px-4 sm:px-6 md:px-8">
        {activeMode === 'voice' && <VoiceCall/>}
        {activeMode === 'video' && <VideoCall/>}
        {activeMode === 'screen' && <ScreenCall />}
      </div>

      {/* Tab Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100">
        <div className="grid grid-cols-3 h-16 bg-white">
          <button 
            onClick={() => setActiveMode('voice')}
            className={`flex flex-col items-center justify-center ${activeMode === 'voice' ? 'text-red-300' : 'text-white-500'}`}
          >
            <i className="fas fa-phone-alt mb-1"></i>
            <span className="text-xs">语音</span>
          </button>
          <button 
            onClick={() => setActiveMode('video')}
            className={`flex flex-col items-center justify-center ${activeMode === 'video' ? 'text-red-300' : 'text-white-500'}`}
          >
            <i className="fas fa-video mb-1"></i>
            <span className="text-xs">视频</span>
          </button>
          <button 
            onClick={() => setActiveMode('screen')}
            className={`flex flex-col items-center justify-center ${activeMode === 'screen' ? 'text-red-300' : 'text-white-500'}`}
          >
            <i className="fas fa-desktop mb-1"></i>
            <span className="text-xs">共享</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeminiCall; 