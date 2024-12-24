#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Date  : 2024/12/18 15:37
# @File  : backend_api3.py.py
# @Author: 可用
# @Desc  :

import asyncio
import websockets
import json
import os
import logging
import dotenv
from websockets_proxy import Proxy, proxy_connect

PROXY_URL = "http://127.0.0.1:7890"
# PROXY_URL = ""
DEBUG = True
# 配置logging
logging.basicConfig(
    level=logging.DEBUG if DEBUG else logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('backend.log'),
        logging.StreamHandler()  # 同时输出到控制台
    ]
)
logger = logging.getLogger(__name__)

dotenv.load_dotenv()
API_KEY = os.getenv("REACT_APP_GEMINI_API_KEY")
logging.info(f"API_KEY: {API_KEY}")
assert API_KEY, "需要设置环境变量 REACT_APP_GEMINI_API_KEY in .env"

# Gemini WebSocket API URL
GEMINI_WS_URL = f"wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent"
GEMINI_WS_URL += f"?key={API_KEY}"


async def relay_handler(client_ws, path):
    """Handles the WebSocket connection with the client."""
    try:
        # Connect to Gemini WebSocket
        if PROXY_URL:
            proxy = Proxy.from_url(PROXY_URL)
            async with proxy_connect(GEMINI_WS_URL, proxy=proxy) as gemini_ws:
                # Task for relaying messages from Gemini to the client
                async def gemini_to_client():
                    async for message in gemini_ws:
                        logger.info(f"Received from Gemini: {message}")
                        await client_ws.send(message)

                # Task for relaying messages from the client to Gemini
                async def client_to_gemini():
                    async for message in client_ws:
                        logger.info(f"Received from client: {message}")
                        await gemini_ws.send(message)
                # Run both tasks concurrently
                await asyncio.gather(gemini_to_client(), client_to_gemini())
        else:
            async with websockets.connect(GEMINI_WS_URL) as gemini_ws:
                # Task for relaying messages from Gemini to the client
                async def gemini_to_client():
                    async for message in gemini_ws:
                        logger.info(f"Received from Gemini: {message}")
                        await client_ws.send(message)

                # Task for relaying messages from the client to Gemini
                async def client_to_gemini():
                    async for message in client_ws:
                        logger.info(f"Received from client: {message}")
                        await gemini_ws.send(message)

                # Run both tasks concurrently
                await asyncio.gather(gemini_to_client(), client_to_gemini())

    except websockets.exceptions.ConnectionClosed as e:
        print(f"Connection closed: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")

async def main():
    """Starts the WebSocket relay server."""
    server = await websockets.serve(relay_handler, "0.0.0.0", 8080)
    print("WebSocket relay server started on ws://localhost:8080")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())
