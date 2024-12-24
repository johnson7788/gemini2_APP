import React from 'react';
import { useCallStore } from './src/store';
import { useLiveAPI } from './src/hooks/use-live-api';


const avatarImage = 'https://ai-public.mastergo.com/ai/img_res/0913368a13a3894224a4ccb6ca282518.jpg';
const VoiceCall: React.FC = () => {
  const { 
    callDuration, 
    isMuted, 
    setIsMuted, 
    isSpeakerOn, 
    setIsSpeakerOn, 
    isConnected,
    handleConnect,
    config,
    handleDisconnect,
    setLiveAPIState,
  } = useCallStore();

  // 初始化 LiveAPI
  const liveAPI = useLiveAPI({
    url: config.url,
    apiKey: config.apiKey
  });
  // 修改 handleConnect 的调用
  const handleVoiceConnect = async () => {
    try {
      setLiveAPIState(liveAPI);
      await handleConnect('voice');
    } catch (error) {
      console.error('语音连接失败:', error);
    }
  };

  const handleVoiceDisconnect = async () => {
    await handleDisconnect('voice');
  };

  return (
    <>
      <div className="flex flex-col items-center pt-12">
        <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
          <img src={avatarImage} alt="头像" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-xl font-medium text-gray-800 mb-2">AI</h2>
        <p className="text-gray-500 mb-8">Moderator</p>
        <div className="text-2xl font-medium text-gray-700 mb-12">{callDuration}</div>
        {isConnected && <p className="text-sm text-green-500 mb-20">通话中...</p>}
      </div>
      
      {/* Control Bar */}
      <div className="fixed bottom-16 left-0 w-full bg-white border-t border-gray-100 px-6 py-4">
        <div className="flex justify-around items-center">
          {isConnected ? (
            <>
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center !rounded-button"
              >
                <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'} text-gray-700`}></i>
              </button>
              <button 
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center !rounded-button"
              >
                <i className={`fas ${isSpeakerOn ? 'fa-volume-up' : 'fa-volume-mute'} text-gray-700`}></i>
              </button>
              <button 
                onClick={() => handleVoiceDisconnect()}
                className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center !rounded-button">
                <i className="fas fa-phone-slash text-red-500"></i>
              </button>
            </>
          ) : (
            <button 
              onClick={() => handleVoiceConnect()}
              id = "call-button"
              className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center !rounded-button">
              <i className="fas fa-phone text-green-500"></i>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default VoiceCall; 