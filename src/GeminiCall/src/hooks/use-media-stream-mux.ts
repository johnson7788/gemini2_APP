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

export type UseMediaStreamResult = {
  type: "webcam" | "screen"; // 流类型：摄像头或屏幕共享
  start: () => Promise<MediaStream>; // 启动流
  stop: () => void; // 停止流
  isStreaming: boolean; // 是否正在流式传输
  stream: MediaStream | null; // 当前的媒体流
  toggleCamera?: () => Promise<void>; // 切换摄像头方向（仅在 "webcam" 类型时可用）
  facingMode?: "user" | "environment"; // 当前摄像头方向（仅在 "webcam" 类型时可用）
};