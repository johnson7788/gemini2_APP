/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState, useEffect } from "react";
import { UseMediaStreamResult } from "./use-media-stream-mux";

export function useWebcam(): UseMediaStreamResult {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  useEffect(() => {
    const handleStreamEnded = () => {
      setIsStreaming(false);
      setStream(null);
    };
    if (stream) {
      stream
        .getTracks()
        .forEach((track) => track.addEventListener("ended", handleStreamEnded));
      return () => {
        stream
          .getTracks()
          .forEach((track) =>
            track.removeEventListener("ended", handleStreamEnded)
          );
      };
    }
  }, [stream]);

  const start = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }, // 动态设置摄像头方向
      });
      setStream(mediaStream);
      setIsStreaming(true);
      return mediaStream;
    } catch (error) {
      console.error("Error accessing webcam:", error);
      throw error;
    }
  };

  const stop = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsStreaming(false);
    }
  };

  const toggleCamera = async () => {
    if (isStreaming) {
      stop();
    }
    // 切换摄像头方向
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
    await start(); // 重新启动摄像头流
  };

  const result: UseMediaStreamResult = {
    type: "webcam",
    start,
    stop,
    isStreaming,
    stream,
    toggleCamera, // 新增的切换摄像头功能
    facingMode,   // 可供外部访问当前的摄像头方向
  };

  return result;
}

