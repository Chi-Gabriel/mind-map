// FIX: Import the React namespace to use types like React.RefObject.
import React, { useState, useRef, useCallback, useEffect } from 'react';

export interface Transform {
  x: number;
  y: number;
  k: number;
}

export const useTransform = (
  containerRef: React.RefObject<SVGSVGElement | HTMLDivElement>,
  initialTransform: Transform
): [Transform, (newTransform: Partial<Transform>) => void] => {
  const [transform, setTransform] = useState<Transform>(initialTransform);
  const isPanning = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });

  const updateTransform = useCallback((newTransform: Partial<Transform>) => {
    setTransform(prev => ({ ...prev, ...newTransform }));
  }, []);

  const onMouseDown = useCallback((e: MouseEvent) => {
    isPanning.current = true;
    lastPoint.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPoint.current.x;
    const dy = e.clientY - lastPoint.current.y;
    lastPoint.current = { x: e.clientX, y: e.clientY };
    
    setTransform(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
    }));
  }, []);

  const onMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const { clientX, clientY, deltaY } = e;
    const { left, top } = container.getBoundingClientRect();
    const scaleFactor = 1.1;

    setTransform(prev => {
        const newK = deltaY < 0 ? prev.k * scaleFactor : prev.k / scaleFactor;
        const boundedK = Math.max(0.1, Math.min(newK, 5));

        const mouseX = clientX - left;
        const mouseY = clientY - top;
        
        const newX = mouseX - (mouseX - prev.x) * (boundedK / prev.k);
        const newY = mouseY - (mouseY - prev.y) * (boundedK / prev.k);
        
        return { k: boundedK, x: newX, y: newY };
    });
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mouseleave', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('mouseleave', onMouseUp);
      container.removeEventListener('wheel', onWheel);
    };
  }, [containerRef, onMouseDown, onMouseMove, onMouseUp, onWheel]);

  return [transform, updateTransform];
};