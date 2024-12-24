import React from 'react';
import { MindMap } from './MindMap';
//思维导图的展开形式
const knowledgeData = {
    "id": "root",
    "name": "顶层节点",
    "description": "这是顶层节点的描述",
    "children": [
        {
            "id": "node1",
            "name": "子节点 1",
            "description": "这是子节点 1 的描述",
            "children": [
                {
                    "id": "node1_1",
                    "name": "子节点 1.1",
                    "description": "这是子节点 1.1 的描述",
                    "children": []
                }
            ]
        },
        {
            "id": "node2",
            "name": "子节点 2",
            "description": "这是子节点 2 的描述",
            "children": []
        }
    ]
};

function App() {
    return (
        <div className="w-full h-screen">
            <MindMap data={knowledgeData} />
        </div>
    );
}

export default App;