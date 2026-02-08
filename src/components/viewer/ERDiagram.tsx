'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { RemlSchema, TableDef, ForeignKeyDef } from '@/lib/schema/types';

interface ERDiagramProps {
  schema: RemlSchema;
  onSvgRef?: (ref: SVGSVGElement | null) => void;
}

interface TablePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TableNode {
  name: string;
  table: TableDef;
  position: TablePosition;
  columns: { name: string; label?: string; type: string; isPK: boolean; isFK: boolean }[];
  headerHeight: number;
}

type DisplayMode = 'compact' | 'full';
type LayoutDirection = 'horizontal' | 'vertical';

interface Edge {
  from: { table: string; column: string };
  to: { table: string; column: string };
  cardinality: '1:1' | '1:N';
}

function inferCardinality(
  fk: ForeignKeyDef,
  table: TableDef,
): '1:1' | '1:N' {
  const fkCols = Array.isArray(fk.columns) ? fk.columns : [fk.columns];

  // Check: FK column has unique: true
  if (fkCols.length === 1 && table.columns[fkCols[0]]?.unique) {
    return '1:1';
  }

  // Check: FK columns appear in uniqueConstraints
  if (
    table.uniqueConstraints?.some((uc) => {
      const ucCols = [...uc.columns].sort();
      const fkSorted = [...fkCols].sort();
      return (
        ucCols.length === fkSorted.length &&
        ucCols.every((c, i) => c === fkSorted[i])
      );
    })
  ) {
    return '1:1';
  }

  // Check: FK columns are the entire PK
  const pkCols = table.primaryKey
    ? Array.isArray(table.primaryKey)
      ? table.primaryKey
      : [table.primaryKey]
    : Object.entries(table.columns)
        .filter(([, col]) => col.primaryKey)
        .map(([name]) => name);

  const pkSorted = [...pkCols].sort();
  const fkSorted = [...fkCols].sort();
  if (
    pkSorted.length === fkSorted.length &&
    pkSorted.every((c, i) => c === fkSorted[i])
  ) {
    return '1:1';
  }

  return '1:N';
}

const TABLE_WIDTH = 180;
const HEADER_HEIGHT = 32;
const HEADER_HEIGHT_WITH_LABEL = 46; // Taller header when table has a label
const ROW_HEIGHT = 24;
const TABLE_PADDING = 8;
const LEVEL_GAP = 80; // Gap between levels
const NODE_GAP = 30; // Gap between nodes in same level

// Calculate hierarchical levels based on FK dependencies
function calculateLevels(
  tableNames: string[],
  dependencies: Map<string, Set<string>>
): Map<string, number> {
  const levels = new Map<string, number>();
  const visited = new Set<string>();
  const inProgress = new Set<string>();

  // Calculate level for a table (DFS with cycle detection)
  function getLevel(tableName: string, path: Set<string> = new Set()): number {
    if (levels.has(tableName)) {
      return levels.get(tableName)!;
    }

    // Cycle detection - if we're revisiting a node in current path, break the cycle
    if (path.has(tableName)) {
      return 0;
    }

    path.add(tableName);
    const deps = dependencies.get(tableName) || new Set();
    let maxDepLevel = -1;

    for (const dep of deps) {
      // Skip self-references
      if (dep === tableName) continue;
      // Only consider tables that exist
      if (!tableNames.includes(dep)) continue;

      const depLevel = getLevel(dep, new Set(path));
      maxDepLevel = Math.max(maxDepLevel, depLevel);
    }

    const level = maxDepLevel + 1;
    levels.set(tableName, level);
    return level;
  }

  // Calculate levels for all tables
  for (const tableName of tableNames) {
    getLevel(tableName);
  }

  return levels;
}

export function ERDiagram({ schema, onSvgRef }: ERDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<TableNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1200, height: 800 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [displayMode, setDisplayMode] = useState<DisplayMode>('compact');
  const [layoutDirection, setLayoutDirection] = useState<LayoutDirection>('horizontal');

  // Initialize nodes and edges from schema
  useEffect(() => {
    const tableNames = Object.keys(schema.tables);
    const newNodes: TableNode[] = [];
    const newEdges: Edge[] = [];

    // Build dependency map (table -> tables it references via FK)
    const dependencies = new Map<string, Set<string>>();
    tableNames.forEach((tableName) => {
      const table = schema.tables[tableName];
      const deps = new Set<string>();
      (table.foreignKeys || []).forEach((fk) => {
        deps.add(fk.references.table);
      });
      dependencies.set(tableName, deps);
    });

    // Calculate hierarchical levels
    const levels = calculateLevels(tableNames, dependencies);

    // Group tables by level
    const levelGroups = new Map<number, string[]>();
    tableNames.forEach((tableName) => {
      const level = levels.get(tableName) || 0;
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      levelGroups.get(level)!.push(tableName);
    });

    // Sort levels
    const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => a - b);

    // Pre-calculate node info for height calculation
    const nodeInfoMap = new Map<string, {
      displayColumns: { name: string; label?: string; type: string; isPK: boolean; isFK: boolean }[];
      height: number;
      width: number;
      headerHeight: number;
    }>();

    tableNames.forEach((tableName) => {
      const table = schema.tables[tableName];
      const columnNames = Object.keys(table.columns);

      // Get PK columns
      const pkColumns = table.primaryKey
        ? Array.isArray(table.primaryKey)
          ? table.primaryKey
          : [table.primaryKey]
        : columnNames.filter((col) => table.columns[col].primaryKey);

      // Get FK columns
      const fkColumns = (table.foreignKeys || []).flatMap((fk) =>
        Array.isArray(fk.columns) ? fk.columns : [fk.columns]
      );

      // Determine which columns to display based on mode
      let displayColumns: { name: string; label?: string; type: string; isPK: boolean; isFK: boolean }[];

      if (displayMode === 'full') {
        displayColumns = columnNames.map((col) => ({
          name: col,
          label: table.columns[col].label,
          type: table.columns[col].type,
          isPK: pkColumns.includes(col),
          isFK: fkColumns.includes(col),
        }));
      } else {
        displayColumns = columnNames
          .filter((col) => pkColumns.includes(col) || fkColumns.includes(col))
          .map((col) => ({
            name: col,
            label: table.columns[col].label,
            type: table.columns[col].type,
            isPK: pkColumns.includes(col),
            isFK: fkColumns.includes(col),
          }));

        if (displayColumns.length === 0) {
          columnNames.slice(0, 3).forEach((col) => {
            displayColumns.push({
              name: col,
              label: table.columns[col].label,
              type: table.columns[col].type,
              isPK: false,
              isFK: false,
            });
          });
        }
      }

      const headerHeight = table.label ? HEADER_HEIGHT_WITH_LABEL : HEADER_HEIGHT;
      const height = headerHeight + displayColumns.length * ROW_HEIGHT + TABLE_PADDING * 2;
      const width = displayMode === 'full' ? TABLE_WIDTH + 60 : TABLE_WIDTH;

      nodeInfoMap.set(tableName, { displayColumns, height, width, headerHeight });
    });

    // Layout depends on direction
    if (layoutDirection === 'horizontal') {
      // Horizontal layout: Left to Right
      // Calculate max width per level for X positioning
      const levelWidths = new Map<number, number>();
      sortedLevels.forEach((level) => {
        const tablesInLevel = levelGroups.get(level) || [];
        let maxWidth = 0;
        tablesInLevel.forEach((tableName) => {
          const info = nodeInfoMap.get(tableName)!;
          maxWidth = Math.max(maxWidth, info.width);
        });
        levelWidths.set(level, maxWidth);
      });

      // Calculate X position for each level
      const levelXPositions = new Map<number, number>();
      let currentX = 50;
      sortedLevels.forEach((level) => {
        levelXPositions.set(level, currentX);
        currentX += (levelWidths.get(level) || 0) + LEVEL_GAP;
      });

      // Calculate Y positions - stack tables vertically within each level
      sortedLevels.forEach((level) => {
        const tablesInLevel = levelGroups.get(level) || [];
        let currentY = 50;

        tablesInLevel.forEach((tableName) => {
          const table = schema.tables[tableName];
          const info = nodeInfoMap.get(tableName)!;
          const x = levelXPositions.get(level) || 0;

          newNodes.push({
            name: tableName,
            table,
            position: { x, y: currentY, width: info.width, height: info.height },
            columns: info.displayColumns,
            headerHeight: info.headerHeight,
          });

          currentY += info.height + NODE_GAP;

          // Create edges from foreign keys
          (table.foreignKeys || []).forEach((fk: ForeignKeyDef) => {
            const fromCols = Array.isArray(fk.columns) ? fk.columns : [fk.columns];
            const toCols = Array.isArray(fk.references.columns)
              ? fk.references.columns
              : [fk.references.columns];

            fromCols.forEach((fromCol, i) => {
              newEdges.push({
                from: { table: tableName, column: fromCol },
                to: { table: fk.references.table, column: toCols[i] || toCols[0] },
                cardinality: inferCardinality(fk, table),
              });
            });
          });
        });
      });
    } else {
      // Vertical layout: Top to Bottom
      // Calculate max height per level for Y positioning
      const levelHeights = new Map<number, number>();
      sortedLevels.forEach((level) => {
        const tablesInLevel = levelGroups.get(level) || [];
        let maxHeight = 0;
        tablesInLevel.forEach((tableName) => {
          const info = nodeInfoMap.get(tableName)!;
          maxHeight = Math.max(maxHeight, info.height);
        });
        levelHeights.set(level, maxHeight);
      });

      // Calculate Y position for each level
      const levelYPositions = new Map<number, number>();
      let currentY = 50;
      sortedLevels.forEach((level) => {
        levelYPositions.set(level, currentY);
        currentY += (levelHeights.get(level) || 0) + LEVEL_GAP;
      });

      // Calculate X positions - stack tables horizontally within each level
      sortedLevels.forEach((level) => {
        const tablesInLevel = levelGroups.get(level) || [];
        let currentX = 50;

        tablesInLevel.forEach((tableName) => {
          const table = schema.tables[tableName];
          const info = nodeInfoMap.get(tableName)!;
          const y = levelYPositions.get(level) || 0;

          newNodes.push({
            name: tableName,
            table,
            position: { x: currentX, y, width: info.width, height: info.height },
            columns: info.displayColumns,
            headerHeight: info.headerHeight,
          });

          currentX += info.width + NODE_GAP;

          // Create edges from foreign keys
          (table.foreignKeys || []).forEach((fk: ForeignKeyDef) => {
            const fromCols = Array.isArray(fk.columns) ? fk.columns : [fk.columns];
            const toCols = Array.isArray(fk.references.columns)
              ? fk.references.columns
              : [fk.references.columns];

            fromCols.forEach((fromCol, i) => {
              newEdges.push({
                from: { table: tableName, column: fromCol },
                to: { table: fk.references.table, column: toCols[i] || toCols[0] },
                cardinality: inferCardinality(fk, table),
              });
            });
          });
        });
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);

    // Adjust viewBox to fit all nodes
    if (newNodes.length > 0) {
      const maxX = Math.max(...newNodes.map((n) => n.position.x + n.position.width)) + 100;
      const maxY = Math.max(...newNodes.map((n) => n.position.y + n.position.height)) + 100;
      setViewBox({ x: 0, y: 0, width: Math.max(maxX, 800), height: Math.max(maxY, 600) });
    }
  }, [schema, displayMode, layoutDirection]);

  // Handle mouse down on table
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, tableName: string) => {
      e.stopPropagation();
      const node = nodes.find((n) => n.name === tableName);
      if (node && svgRef.current) {
        const svgRect = svgRef.current.getBoundingClientRect();
        const scale = viewBox.width / svgRect.width;
        setDragging(tableName);
        setDragOffset({
          x: (e.clientX - svgRect.left) * scale + viewBox.x - node.position.x,
          y: (e.clientY - svgRect.top) * scale + viewBox.y - node.position.y,
        });
      }
    },
    [nodes, viewBox]
  );

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragging && svgRef.current) {
        const svgRect = svgRef.current.getBoundingClientRect();
        const scale = viewBox.width / svgRect.width;
        const newX = (e.clientX - svgRect.left) * scale + viewBox.x - dragOffset.x;
        const newY = (e.clientY - svgRect.top) * scale + viewBox.y - dragOffset.y;

        setNodes((prev) =>
          prev.map((node) =>
            node.name === dragging
              ? { ...node, position: { ...node.position, x: newX, y: newY } }
              : node
          )
        );
      } else if (isPanning && svgRef.current) {
        const svgRect = svgRef.current.getBoundingClientRect();
        const scale = viewBox.width / svgRect.width;
        const dx = (e.clientX - panStart.x) * scale;
        const dy = (e.clientY - panStart.y) * scale;

        setViewBox((prev) => ({
          ...prev,
          x: prev.x - dx,
          y: prev.y - dy,
        }));
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    },
    [dragging, dragOffset, viewBox, isPanning, panStart]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setIsPanning(false);
  }, []);

  // Handle pan start (when clicking on background, not on table nodes)
  const handlePanStart = useCallback((e: React.MouseEvent) => {
    // Allow panning when clicking on the SVG, grid rect, or any non-table element
    const target = e.target as SVGElement;
    // Check if the click is on the SVG itself, the grid rect, or pattern elements
    if (
      target === svgRef.current ||
      target.tagName === 'rect' && !target.closest('g[class*="cursor-move"]') ||
      target.tagName === 'path' && target.closest('pattern')
    ) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, []);

  // Handle zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;

    setViewBox((prev) => {
      const newWidth = prev.width * zoomFactor;
      const newHeight = prev.height * zoomFactor;
      // Zoom towards center
      const dx = (newWidth - prev.width) / 2;
      const dy = (newHeight - prev.height) / 2;
      return {
        x: prev.x - dx,
        y: prev.y - dy,
        width: newWidth,
        height: newHeight,
      };
    });
  }, []);

  // Calculate edge path based on layout direction
  const getEdgePath = (edge: Edge): string => {
    const fromNode = nodes.find((n) => n.name === edge.from.table);
    const toNode = nodes.find((n) => n.name === edge.to.table);

    if (!fromNode || !toNode) return '';

    const fromColIndex = fromNode.columns.findIndex((c) => c.name === edge.from.column);

    // Self-reference - draw a loop
    if (edge.from.table === edge.to.table) {
      const loopSize = 40;
      if (layoutDirection === 'horizontal') {
        const nodeRight = fromNode.position.x + fromNode.position.width;
        const rowY =
          fromNode.position.y +
          fromNode.headerHeight +
          TABLE_PADDING +
          (fromColIndex >= 0 ? fromColIndex : 0) * ROW_HEIGHT +
          ROW_HEIGHT / 2;
        return `M ${nodeRight} ${rowY}
                C ${nodeRight + loopSize} ${rowY - loopSize},
                  ${nodeRight + loopSize} ${rowY + loopSize},
                  ${nodeRight} ${rowY + ROW_HEIGHT}`;
      } else {
        const nodeBottom = fromNode.position.y + fromNode.position.height;
        const centerX = fromNode.position.x + fromNode.position.width / 2;
        return `M ${centerX} ${nodeBottom}
                C ${centerX - loopSize} ${nodeBottom + loopSize},
                  ${centerX + loopSize} ${nodeBottom + loopSize},
                  ${centerX + 20} ${nodeBottom}`;
      }
    }

    const fromRight = fromNode.position.x + fromNode.position.width;
    const toLeft = toNode.position.x;
    const fromLeft = fromNode.position.x;
    const toRight = toNode.position.x + toNode.position.width;
    const fromBottom = fromNode.position.y + fromNode.position.height;
    const toTop = toNode.position.y;
    const fromTop = fromNode.position.y;
    const toBottom = toNode.position.y + toNode.position.height;

    if (layoutDirection === 'horizontal') {
      // Horizontal layout: prefer left-right connections
      if (fromRight < toLeft - 10) {
        // From is left of To
        const fromX = fromRight;
        const toX = toLeft;
        const fromY = fromNode.position.y + fromNode.position.height / 2;
        const toY = toNode.position.y + toNode.position.height / 2;
        const midX = (fromX + toX) / 2;
        return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
      } else if (toRight < fromLeft - 10) {
        // To is left of From
        const fromX = fromLeft;
        const toX = toRight;
        const fromY = fromNode.position.y + fromNode.position.height / 2;
        const toY = toNode.position.y + toNode.position.height / 2;
        const midX = (fromX + toX) / 2;
        return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
      } else {
        // Same column - use vertical connection
        if (fromBottom < toTop - 10) {
          const fromX = fromNode.position.x + fromNode.position.width / 2;
          const toX = toNode.position.x + toNode.position.width / 2;
          const midY = (fromBottom + toTop) / 2;
          return `M ${fromX} ${fromBottom} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toTop}`;
        } else {
          const fromX = fromNode.position.x + fromNode.position.width / 2;
          const toX = toNode.position.x + toNode.position.width / 2;
          const midY = (fromTop + toBottom) / 2;
          return `M ${fromX} ${fromTop} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toBottom}`;
        }
      }
    } else {
      // Vertical layout: prefer top-bottom connections
      if (fromBottom < toTop - 10) {
        // From is above To
        const fromX = fromNode.position.x + fromNode.position.width / 2;
        const toX = toNode.position.x + toNode.position.width / 2;
        const midY = (fromBottom + toTop) / 2;
        return `M ${fromX} ${fromBottom} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toTop}`;
      } else if (toBottom < fromTop - 10) {
        // To is above From
        const fromX = fromNode.position.x + fromNode.position.width / 2;
        const toX = toNode.position.x + toNode.position.width / 2;
        const midY = (fromTop + toBottom) / 2;
        return `M ${fromX} ${fromTop} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toBottom}`;
      } else {
        // Same row - use horizontal connection
        if (fromRight < toLeft - 10) {
          const fromX = fromRight;
          const toX = toLeft;
          const fromY = fromNode.position.y + fromNode.position.height / 2;
          const toY = toNode.position.y + toNode.position.height / 2;
          const midX = (fromX + toX) / 2;
          return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
        } else {
          const fromX = fromLeft;
          const toX = toRight;
          const fromY = fromNode.position.y + fromNode.position.height / 2;
          const toY = toNode.position.y + toNode.position.height / 2;
          const midX = (fromX + toX) / 2;
          return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
        }
      }
    }
  };

  // Reset view
  const resetView = () => {
    if (nodes.length > 0) {
      const maxX = Math.max(...nodes.map((n) => n.position.x + n.position.width)) + 100;
      const maxY = Math.max(...nodes.map((n) => n.position.y + n.position.height)) + 100;
      setViewBox({ x: 0, y: 0, width: Math.max(maxX, 800), height: Math.max(maxY, 600) });
    }
  };

  return (
    <div className="relative w-full h-[600px] bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        {/* Layout Direction Toggle */}
        <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-600 overflow-hidden">
          <button
            onClick={() => setLayoutDirection('horizontal')}
            className={`px-2 py-1.5 text-xs font-medium transition-colors flex items-center gap-1 ${
              layoutDirection === 'horizontal'
                ? 'bg-cyan-500 text-white'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700'
            }`}
            title="Left to Right"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => setLayoutDirection('vertical')}
            className={`px-2 py-1.5 text-xs font-medium transition-colors flex items-center gap-1 ${
              layoutDirection === 'vertical'
                ? 'bg-cyan-500 text-white'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700'
            }`}
            title="Top to Bottom"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7M19 5l-7 7-7-7" />
            </svg>
          </button>
        </div>
        {/* Display Mode Toggle */}
        <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-600 overflow-hidden">
          <button
            onClick={() => setDisplayMode('compact')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              displayMode === 'compact'
                ? 'bg-emerald-500 text-white'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700'
            }`}
          >
            Compact
          </button>
          <button
            onClick={() => setDisplayMode('full')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              displayMode === 'full'
                ? 'bg-emerald-500 text-white'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700'
            }`}
          >
            Full
          </button>
        </div>
        <button
          onClick={resetView}
          className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
        >
          Reset View
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 z-10 flex gap-4 text-xs text-zinc-500 dark:text-zinc-400 bg-white/80 dark:bg-zinc-800/80 px-3 py-2 rounded-lg">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-sm"></span>
          PK
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-cyan-100 dark:bg-cyan-900 border border-cyan-300 dark:border-cyan-700 rounded-sm"></span>
          FK
        </span>
        <span className="text-zinc-400 border-l border-zinc-300 dark:border-zinc-600 pl-4">
          {layoutDirection === 'horizontal' ? 'L→R' : 'T→B'}
        </span>
        <span className="text-zinc-400 border-l border-zinc-300 dark:border-zinc-600 pl-4">
          {displayMode === 'compact' ? 'PK/FK only' : 'All columns'}
        </span>
        <span className="flex items-center gap-1 border-l border-zinc-300 dark:border-zinc-600 pl-4">
          <svg width="20" height="12" viewBox="0 0 20 12">
            <line x1="2" y1="1" x2="2" y2="11" className="stroke-cyan-500 dark:stroke-cyan-400" strokeWidth="1.5"/>
            <line x1="5" y1="1" x2="5" y2="11" className="stroke-cyan-500 dark:stroke-cyan-400" strokeWidth="1.5"/>
          </svg>
          1
        </span>
        <span className="flex items-center gap-1">
          <svg width="20" height="12" viewBox="0 0 20 12">
            <line x1="2" y1="1" x2="10" y2="6" className="stroke-cyan-500 dark:stroke-cyan-400" strokeWidth="1.5"/>
            <line x1="2" y1="11" x2="10" y2="6" className="stroke-cyan-500 dark:stroke-cyan-400" strokeWidth="1.5"/>
            <line x1="2" y1="6" x2="10" y2="6" className="stroke-cyan-500 dark:stroke-cyan-400" strokeWidth="1.5"/>
          </svg>
          N
        </span>
      </div>

      <svg
        ref={(node) => {
          (svgRef as React.MutableRefObject<SVGSVGElement | null>).current = node;
          onSvgRef?.(node);
        }}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handlePanStart}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Defs for cardinality markers (crow's foot notation) */}
        <defs>
          {/* "One" marker at end (PK/referenced side): two parallel lines */}
          <marker
            id="marker-one-end"
            markerWidth="12"
            markerHeight="12"
            refX="12"
            refY="6"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <line x1="8" y1="1" x2="8" y2="11" className="stroke-cyan-500 dark:stroke-cyan-400" strokeWidth="1.5" />
            <line x1="12" y1="1" x2="12" y2="11" className="stroke-cyan-500 dark:stroke-cyan-400" strokeWidth="1.5" />
          </marker>
          {/* "Many" marker at start (FK side): crow's foot */}
          <marker
            id="marker-many-start"
            markerWidth="14"
            markerHeight="14"
            refX="0"
            refY="7"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <line x1="0" y1="1" x2="10" y2="7" className="stroke-cyan-500 dark:stroke-cyan-400" strokeWidth="1.5" />
            <line x1="0" y1="13" x2="10" y2="7" className="stroke-cyan-500 dark:stroke-cyan-400" strokeWidth="1.5" />
            <line x1="0" y1="7" x2="10" y2="7" className="stroke-cyan-500 dark:stroke-cyan-400" strokeWidth="1.5" />
          </marker>
          {/* "One" marker at start (for 1:1 FK side): two parallel lines */}
          <marker
            id="marker-one-start"
            markerWidth="12"
            markerHeight="12"
            refX="0"
            refY="6"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <line x1="0" y1="1" x2="0" y2="11" className="stroke-cyan-500 dark:stroke-cyan-400" strokeWidth="1.5" />
            <line x1="4" y1="1" x2="4" y2="11" className="stroke-cyan-500 dark:stroke-cyan-400" strokeWidth="1.5" />
          </marker>
        </defs>

        {/* Grid pattern (optional) */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              className="stroke-zinc-200 dark:stroke-zinc-800"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect
          x={viewBox.x}
          y={viewBox.y}
          width={viewBox.width}
          height={viewBox.height}
          fill="url(#grid)"
        />

        {/* Edges (draw first so they're behind nodes) */}
        {edges.map((edge, index) => (
          <path
            key={`edge-${index}`}
            d={getEdgePath(edge)}
            fill="none"
            className="stroke-cyan-500 dark:stroke-cyan-400"
            strokeWidth="2"
            markerStart={edge.cardinality === '1:1' ? 'url(#marker-one-start)' : 'url(#marker-many-start)'}
            markerEnd="url(#marker-one-end)"
          />
        ))}

        {/* Table nodes */}
        {nodes.map((node) => (
          <g
            key={node.name}
            transform={`translate(${node.position.x}, ${node.position.y})`}
            onMouseDown={(e) => handleMouseDown(e, node.name)}
            className="cursor-move"
          >
            {/* Table background */}
            <rect
              width={node.position.width}
              height={node.position.height}
              rx="6"
              className="fill-white dark:fill-zinc-800 stroke-emerald-500 dark:stroke-emerald-400"
              strokeWidth="2"
            />

            {/* Table header */}
            <rect
              width={node.position.width}
              height={node.headerHeight}
              rx="6"
              className="fill-emerald-500 dark:fill-emerald-600"
            />
            <rect
              y={node.headerHeight - 6}
              width={node.position.width}
              height="6"
              className="fill-emerald-500 dark:fill-emerald-600"
            />

            {/* Table name */}
            <text
              x={node.position.width / 2}
              y={node.table.label ? 14 : node.headerHeight / 2 + 5}
              textAnchor="middle"
              className="fill-white text-sm font-semibold"
              style={{ fontSize: '14px' }}
            >
              {node.name}
            </text>
            {/* Table label (論理名) */}
            {node.table.label && (
              <text
                x={node.position.width / 2}
                y={30}
                textAnchor="middle"
                className="fill-emerald-100"
                style={{ fontSize: '11px' }}
              >
                {node.table.label.length > 18 ? node.table.label.substring(0, 18) + '...' : node.table.label}
              </text>
            )}

            {/* Columns */}
            {node.columns.map((col, colIndex) => (
              <g key={col.name} transform={`translate(0, ${node.headerHeight + TABLE_PADDING + colIndex * ROW_HEIGHT})`}>
                {/* Row background for PK/FK */}
                {(col.isPK || col.isFK) && (
                  <rect
                    x="4"
                    y="2"
                    width={node.position.width - 8}
                    height={ROW_HEIGHT - 4}
                    rx="3"
                    className={
                      col.isPK
                        ? 'fill-yellow-100 dark:fill-yellow-900/50'
                        : 'fill-cyan-100 dark:fill-cyan-900/50'
                    }
                  />
                )}

                {/* PK/FK indicator */}
                {col.isPK && (
                  <text
                    x="10"
                    y={ROW_HEIGHT / 2 + 4}
                    className="fill-yellow-600 dark:fill-yellow-400 text-xs font-bold"
                    style={{ fontSize: '10px' }}
                  >
                    PK
                  </text>
                )}
                {col.isFK && !col.isPK && (
                  <text
                    x="10"
                    y={ROW_HEIGHT / 2 + 4}
                    className="fill-cyan-600 dark:fill-cyan-400 text-xs font-bold"
                    style={{ fontSize: '10px' }}
                  >
                    FK
                  </text>
                )}

                {/* Column name */}
                <text
                  x={col.isPK || col.isFK ? 35 : 10}
                  y={ROW_HEIGHT / 2 + 4}
                  className="fill-zinc-700 dark:fill-zinc-300 text-xs"
                  style={{ fontSize: '12px' }}
                >
                  {displayMode === 'full'
                    ? col.name.length > 12 ? col.name.substring(0, 12) + '...' : col.name
                    : col.name.length > 15 ? col.name.substring(0, 15) + '...' : col.name}
                </text>

                {/* Column type (only in full mode) */}
                {displayMode === 'full' && (
                  <text
                    x={node.position.width - 8}
                    y={ROW_HEIGHT / 2 + 4}
                    textAnchor="end"
                    className="fill-zinc-400 dark:fill-zinc-500 text-xs"
                    style={{ fontSize: '10px' }}
                  >
                    {col.type.length > 10 ? col.type.substring(0, 10) : col.type}
                  </text>
                )}
              </g>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
