import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { RawNode, MindMapNode } from './types';
import { mindMapData } from './constants';
import MindMap from './components/MindMap';

const buildTree = (nodes: RawNode[]): MindMapNode[] => {
    const nodeMap: { [key:string]: MindMapNode } = {};
    const roots: MindMapNode[] = [];

    // First pass: create MindMapNode for each raw node
    nodes.forEach(node => {
        nodeMap[node.id] = {
            id: node.id,
            name: node.name,
            description: node.description,
            children: [],
            isExpanded: false, // Start with all nodes collapsed
        };
    });

    // Second pass: build the tree structure
    nodes.forEach(node => {
        if (node.parent_id && nodeMap[node.parent_id]) {
            nodeMap[node.parent_id].children.push(nodeMap[node.id]);
        } else if (node.parent_id === null) {
            roots.push(nodeMap[node.id]);
        }
    });

    // Handle cases where a child is listed but its parent might not be a root
    // This ensures all nodes are part of the tree
    const allNodesInTree = new Set<MindMapNode>();
    roots.forEach(r => {
        const queue = [r];
        while(queue.length > 0) {
            const current = queue.shift();
            if(current) {
                allNodesInTree.add(current);
                queue.push(...current.children);
            }
        }
    });
    
    // Find any nodes that weren't part of the initial root trees and add them as roots
    nodes.forEach(node => {
        if (!allNodesInTree.has(nodeMap[node.id])) {
            const raw = nodes.find(n => n.id === node.id);
            if(raw && !nodeMap[raw.parent_id!]){
                 roots.push(nodeMap[node.id]);
             }
        }
    });

    return roots;
};


const App: React.FC = () => {
    const [data, setData] = useState<MindMapNode[]>([]);
    
    useEffect(() => {
        const processedData = mindMapData.filter(n => n.name && n.id);
        const tree = buildTree(processedData);
        setData(tree);
    }, []);

    const handleNodeToggle = useCallback((nodeId: string) => {
        const toggle = (nodes: MindMapNode[]): MindMapNode[] => {
            return nodes.map(node => {
                if (node.id === nodeId) {
                    return { ...node, isExpanded: !node.isExpanded };
                }
                if (node.children && node.children.length > 0) {
                    return { ...node, children: toggle(node.children) };
                }
                return node;
            });
        };
        setData(prevData => toggle(prevData));
    }, []);

    const rootNode = useMemo((): MindMapNode => {
        return {
            id: 'root',
            name: 'Medical Knowledge',
            description: 'Root of the mind map',
            children: data,
            isExpanded: true
        };
    }, [data]);
    

    return (
        <div className="w-screen h-screen flex flex-col overflow-hidden">
            <header className="p-4 bg-[#172a46] border-b border-[#30415d] z-10">
                <h1 className="text-xl font-bold text-slate-50">Interactive Medical Mind Map</h1>
                <p className="text-sm text-slate-400">Expand, collapse, pan, and zoom to explore the data.</p>
            </header>
            <main className="flex-grow relative">
                <MindMap root={rootNode} onNodeToggle={handleNodeToggle} />
            </main>
        </div>
    );
};

export default App;