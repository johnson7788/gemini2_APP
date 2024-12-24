import React, { useRef, useState, useEffect } from 'react';
import { useCallStore } from './src/store';
import { useScreenCapture } from './src/hooks/use-screen-capture';
import { useLiveAPI } from './src/hooks/use-live-api';

const ScreenCall: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null); //用于显示共享屏幕
  const renderCanvasRef = useRef<HTMLCanvasElement>(null); //用于截取视频帧，发送给后端
  const screenCapture = useScreenCapture();
  
  const { 
    callDuration, 
    isConnected,
    isMuted,
    setIsMuted,
    isVideoOn,
    setIsVideoOn,
    handleConnect,
    handleDisconnect,
    setLiveAPIState,
    config,
    isScreenOn,
    setIsScreenOn
  } = useCallStore();

  const liveAPI = useLiveAPI({
    url: config.url,
    apiKey: config.apiKey
  });

  const handleScreenConnect = async () => {
    try {
      setLiveAPIState(liveAPI); //建立连接
      await handleConnect('screen'); // 连接音频
      screenCapture.start(); // 开始共享屏幕
      setIsScreenOn(true); // 设置屏幕共享开启状态的bool值
    } catch (error) {
      console.error('视频连接失败:', error);
    }
  };

  const handleScreenDisconnect = async () => {
    try {
      screenCapture.stop(); // 停止共享屏幕
      await handleDisconnect('screen'); // 断开连接
      setIsScreenOn(false); // 设置屏幕共享开启状态的bool值
    } catch (error) {
      console.error('屏幕断开失败:', error);
    }
  };

  const handleScreenPresent = () => {
    // 共享屏幕的控制
    if (screenCapture.isStreaming) {
      screenCapture.stop();
    } else {
      screenCapture.start();
    }
  };

  useEffect(() => {
    if (videoRef.current && screenCapture?.stream && !videoRef.current.srcObject) {
      videoRef.current.srcObject = screenCapture.stream;
    }
    
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [screenCapture?.stream]); 

    // 添加视频帧发送逻辑
  useEffect(() => {
    let timeoutId: number = -1;

    const sendVideoFrame = () => {
      const video = videoRef.current;
      const canvas = renderCanvasRef.current;

      if (!video || !canvas) {
        return;
      }

      const ctx = canvas.getContext("2d")!;
      canvas.width = video.videoWidth * 0.25;
      canvas.height = video.videoHeight * 0.25;
      //图片的尺寸为0说明是哪里有问题
      console.log('截取图片的尺寸是canvas.width:', canvas.width, 'canvas.height:', canvas.height);

      if (canvas.width + canvas.height > 0) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 1.0);
        const data = base64.slice(base64.indexOf(",") + 1, Infinity);
        liveAPI.client.sendRealtimeInput([{ mimeType: "image/jpeg", data }]);
      }

      if (isConnected) {
        timeoutId = window.setTimeout(sendVideoFrame, 1000 / 0.5);
      }
    };

    if (isConnected && screenCapture?.stream !== null) {
      requestAnimationFrame(sendVideoFrame);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isConnected, screenCapture?.stream]);

  const screenShareImage = 'https://ai-public.mastergo.com/ai/img_res/140d4711d40024d68ca01e659935b604.jpg';

  return (
    <>
      <div className="relative">
      {isScreenOn && (
        <div className="bg-blue-600 text-white text-sm py-2 px-4 mb-4">
          <i className="fas fa-desktop mr-2"></i>
           正在共享屏幕
        </div>
      )}
        <canvas style={{ display: "none" }} ref={renderCanvasRef} />
        {/* 当开始录屏的时候，取消显示示例图片，显示真正的视频 */}
        {!screenCapture.isStreaming ? (
          <img 
            src={screenShareImage} 
            alt="屏幕共享" 
            className="w-[500px] max-w-full mx-auto block" 
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full"
            style={{ display: screenCapture.isStreaming ? 'block' : 'none' }}
          />
        )}
        
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button 
            onClick={handleScreenPresent}
            className="action-button"
            disabled={!isConnected}
          >
            <span className="material-symbols-outlined">
              {screenCapture.isStreaming ? 'cancel_presentation' : 'present_to_all'}
            </span>
          </button>
        </div>
        
        <div className="absolute top-4 left-4">
          <div className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
            {callDuration}
          </div>
        </div>
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
                onClick={() => setIsVideoOn(!isVideoOn)}
                className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center !rounded-button"
              >
                <i className={`fas ${isVideoOn ? 'fa-video' : 'fa-video-slash'} text-gray-700`}></i>
              </button>
              <button
                onClick={() => handleScreenDisconnect()}
                className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center !rounded-button">
                <i className="fas fa-phone-slash text-red-500"></i>
              </button>
            </>
          ) : (
            <button 
              onClick={() => handleScreenConnect()}
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

export default ScreenCall; 