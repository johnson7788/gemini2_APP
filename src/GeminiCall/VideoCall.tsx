import React, { useRef, useState, useEffect } from 'react';
import { useCallStore } from './src/store';
import { useWebcam } from './src/hooks/use-webcam';
import cn from 'classnames';
import { useLiveAPI } from './src/hooks/use-live-api';

const VideoCall: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const renderCanvasRef = useRef<HTMLCanvasElement>(null);
  const webcam = useWebcam();
  
  const { 
    callDuration, 
    isVideoOn, 
    setIsVideoOn, 
    isConnected,
    isMuted,
    setIsMuted,
    handleConnect,
    handleDisconnect,
    liveAPIClient,
    config,
    setLiveAPIState
  } = useCallStore();

  const liveAPI = useLiveAPI({
    url: config.url,
    apiKey: config.apiKey
  });

  const handleVideoConnect = async () => {
    try {
      setLiveAPIState(liveAPI);
      await handleConnect('video');
      webcam.start(); // 开启摄像头
    } catch (error) {
      console.error('视频连接失败:', error);
    }
  };

  const handleVideoDisconnect = async () => {
    // Stop video stream if it exists
    if (webcam.stream) {
      webcam.stream.getTracks().forEach(track => track.stop());
    }
    await handleDisconnect('video');
    webcam.stop(); // 关闭摄像头
  };


  const remoteVideoImage = 'https://ai-public.mastergo.com/ai/img_res/a74f7b17b09df86fd70a0de42d649b81.jpg';
  const localVideoImage = 'https://ai-public.mastergo.com/ai/img_res/aa355c3e1c7c7ec7aaffc572a3f5f78c.jpg';

  useEffect(() => {
    if (videoRef.current && webcam?.stream && !videoRef.current.srcObject) {
      videoRef.current.srcObject = webcam.stream;
    }
    
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [webcam?.stream]); 

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
        liveAPIClient.sendRealtimeInput([{ mimeType: "image/jpeg", data }]);
      }

      if (isConnected) {
        timeoutId = window.setTimeout(sendVideoFrame, 1000 / 0.5);
      }
    };

    if (isConnected && webcam?.stream !== null) {
      requestAnimationFrame(sendVideoFrame);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isConnected, webcam?.stream]);

  return (
    <>
      <div className="relative w-full h-[calc(100vh-200px)]">
        {!isVideoOn ? (
          <>
            <img src={remoteVideoImage} alt="远程视频" className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 w-48 h-72 rounded-lg overflow-hidden shadow-lg">
              <img src={localVideoImage} alt="本地视频" className="w-full h-full object-cover" />
            </div>
          </>
        ) : (
          <></>
        )}
        <div className="absolute top-4 left-4">
          <div className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
            {callDuration}
          </div>
        </div>
        <canvas style={{ display: "none" }} ref={renderCanvasRef} />
        <div id="local-video" className="local-video absolute top-4 right-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn("w-48 h-72 rounded-lg", {
              hidden: !isVideoOn
            })}
          />
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
                onClick={() =>handleVideoDisconnect()}
                className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center !rounded-button">
                <i className="fas fa-phone-slash text-red-500"></i>
              </button>
            </>
          ) : (
            <button 
              onClick={() => handleVideoConnect()}
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

export default VideoCall; 