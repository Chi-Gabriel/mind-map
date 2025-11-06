import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { MindMapNode } from '../types';
import Node from './Node';
import { useTransform } from '../hooks/useTransform';

interface MindMapProps {
  root: MindMapNode;
  onNodeToggle: (nodeId: string) => void;
}

const getLinkPath = (link: d3.HierarchyPointLink<MindMapNode>): string => {
    const sourceX = link.source.y;
    const sourceY = link.source.x;
    const targetX = link.target.y;
    const targetY = link.target.x;
    
    // Node width is 180, so half is 90.
    const nodeHalfWidth = 90;

    // Start point: right edge of source node. If source is root, start near its coordinate.
    const startPointX = link.source.depth === 0 ? sourceX - 10 : sourceX + nodeHalfWidth;

    // End point: left edge of target node, with an offset for the arrowhead.
    const endPointX = targetX - nodeHalfWidth - 6;

    const controlPointX1 = startPointX + (endPointX - startPointX) / 2;
    
    return `M ${startPointX},${sourceY} C ${controlPointX1},${sourceY} ${controlPointX1},${targetY} ${endPointX},${targetY}`;
};

const MindMap: React.FC<MindMapProps> = ({ root, onNodeToggle }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [transform, setTransform] = useTransform(containerRef, { x: 0, y: 0, k: 0.8 });

  const { nodes, links } = useMemo(() => {
    if (!root) return { nodes: [], links: [] };

    const hierarchy = d3.hierarchy(root, d => d.isExpanded ? d.children : null);
    
    const treeLayout = d3.tree<MindMapNode>().nodeSize([120, 300]); // Increased spacing for clarity
    const treeData = treeLayout(hierarchy);

    const nodes = treeData.descendants();
    const links = treeData.links();

    return { nodes, links };
  }, [root]);

  useEffect(() => {
    if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setTransform({ x: width / 6, y: height / 2, k: 0.8 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing">
      <svg ref={svgRef} className="w-full h-full">
        <defs>
            <marker
                id="arrowhead"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
            >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
            </marker>
        </defs>
        <g style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})` }}>
          {links.map((link, i) => (
            <path
              key={`link-${i}`}
              d={getLinkPath(link)}
              className="fill-none stroke-slate-500/80 transition-all duration-300"
              strokeWidth="1.5"
              markerEnd="url(#arrowhead)"
            />
          ))}
          {nodes.map((node) => (
            <Node
              key={node.data.id}
              node={node}
              onNodeToggle={onNodeToggle}
            />
          ))}
        </g>
      </svg>
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
          <button onClick={() => setTransform({k: Math.min(transform.k * 1.2, 5)})} className="w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700/80 flex items-center justify-center text-white text-xl font-bold backdrop-blur-sm shadow-lg">
              +
          </button>
          <button onClick={() => setTransform({k: Math.max(transform.k / 1.2, 0.1)})} className="w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700/80 flex items-center justify-center text-white text-2xl font-bold backdrop-blur-sm shadow-lg">
              -
          </button>
      </div>
    </div>
  );
};

export default MindMap;