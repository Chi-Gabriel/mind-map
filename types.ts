export interface RawNode {
  id: string;
  name: string;
  description: string | null;
  owner_id: string | null;
  parent_id: string | null;
  children: RawNode[];
}

export interface MindMapNode {
  id: string;
  name: string;
  description: string | null;
  children: MindMapNode[];
  isExpanded?: boolean;
  depth?: number;
  x?: number;
  y?: number;
}
