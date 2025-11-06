import React from 'react';
import type { MindMapNode } from '../types';
import type * as d3 from 'd3';

interface NodeProps {
  node: d3.HierarchyPointNode<MindMapNode>;
  onNodeToggle: (nodeId: string) => void;
}

const NODE_WIDTH = 180;
const NODE_HEIGHT = 50;

const Node: React.FC<NodeProps> = ({ node, onNodeToggle }) => {
    const hasChildren = node.data.children && node.data.children.length > 0;
    const isRoot = node.depth === 0;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasChildren) {
            onNodeToggle(node.data.id);
        }
    };
    
    // D3 tree layout gives (y,x) for horizontal layout. We swap them for rendering.
    const x = node.y;
    const y = node.x;

    if (isRoot) {
        return (
            <g transform={`translate(${x}, ${y})`}>
                <text
                    x={-15}
                    textAnchor="end"
                    dy=".35em"
                    className="text-lg font-semibold fill-slate-100"
                >
                    {node.data.name}
                </text>
            </g>
        );
    }

    return (
        <g
          transform={`translate(${x}, ${y})`}
          className="transition-transform duration-300 ease-in-out"
        >
            <foreignObject x={-NODE_WIDTH / 2} y={-NODE_HEIGHT / 2} width={NODE_WIDTH} height={NODE_HEIGHT}>
                <div
                    className="relative w-full h-full flex items-center justify-center p-2 rounded-lg shadow-md bg-slate-700 hover:bg-slate-600 transition-colors duration-200 cursor-pointer"
                    onClick={handleToggle}
                >
                    <span className="text-center text-sm font-medium text-slate-50 break-words">
                        {node.data.name}
                    </span>

                    {hasChildren && (
                        <div
                            className={`absolute top-1/2 -translate-y-1/2 -right-[12px] flex items-center justify-center w-6 h-6 rounded-full bg-slate-800/90 text-slate-300 transition-transform duration-300
                            ${node.data.isExpanded ? 'transform rotate-90' : ''}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    )}
                </div>
            </foreignObject>
        </g>
    );
};

export default React.memo(Node);