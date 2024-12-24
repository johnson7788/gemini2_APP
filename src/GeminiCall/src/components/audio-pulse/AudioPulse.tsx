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

import "./audio-pulse.scss";
import React from "react";
import { useEffect, useRef } from "react";
import c from "classnames";

const lineCount = 3;  // 脉冲线条数量
//用于显示音频脉冲动画效果
export type AudioPulseProps = {
  active: boolean;    // 控制是否激活
  volume: number;     // 音量大小
  hover?: boolean;    // 悬停状态
};

export default function AudioPulse({ active, volume, hover }: AudioPulseProps) {
  const lines = useRef<HTMLDivElement[]>([]);  // 存储线条DOM引用
  // 每100ms更新一次线条高度
  // 中间线条的高度变化更大（乘以400）
  // 两侧线条变化较小（乘以60）
  // 最大高度限制为24px
  useEffect(() => {
    let timeout: number | null = null;
    const update = () => {
      lines.current.forEach(
        (line, i) =>
        (line.style.height = `${Math.min(
          24,
          4 + volume * (i === 1 ? 400 : 60),
        )}px`),
      );
      timeout = window.setTimeout(update, 100);
    };

    update();

    return () => clearTimeout((timeout as number)!);
  }, [volume]);
  // 创建3个垂直线条，每个线条有不同的动画延迟，使用className条件渲染active和hover状态
  return (
    <div className={c("audioPulse", { active, hover })}>
      {Array(lineCount)
        .fill(null)
        .map((_, i) => (
          <div
            key={i}
            ref={(el) => (lines.current[i] = el!)}
            style={{ animationDelay: `${i * 133}ms` }}
          />
        ))}
    </div>
  );
}
