
import React from 'react';
import { FieldType, FieldConfig } from '../types';

const fieldConfigs: Record<FieldType, FieldConfig> = {
  [FieldType.Master]: {
    totalLength: 90,
    totalWidth: 35,
    endzoneDepth: 10,
    continuousLines: [10, 20, 30, 35],
    dashedLines: [5, 15, 25],
    hasTechArea: false,
    hasHashMarks: false,
    hasNumbers: false,
    hasCenterHashMark: true,
  },
  [FieldType.Under15_18]: {
    totalLength: 120,
    totalWidth: 45,
    endzoneDepth: 10,
    continuousLines: [10, 20, 30, 40, 50],
    dashedLines: [25, 35],
    hasTechArea: true,
    techArea: { startYard: 20, depth: 5, offset: 2 },
    hasHashMarks: true,
    hashMarkPositions: [3/8, 5/8],
    hasNumbers: true,
    numberOffset: 8,
  },
  [FieldType.Senior]: {
    totalLength: 120,
    totalWidth: 54,
    endzoneDepth: 10,
    continuousLines: [10, 20, 30, 40, 50],
    dashedLines: [25, 35],
    hasTechArea: true,
    techArea: { startYard: 20, depth: 5, offset: 2 },
    hasHashMarks: true,
    hashMarkPositions: [3/8, 5/8],
    hasNumbers: true,
    numberOffset: 8,
  },
  [FieldType.Flag]: {
    totalLength: 70,
    totalWidth: 35,
    endzoneDepth: 10,
    continuousLines: [25], // Center line
    dashedLines: [],
    hasTechArea: false,
    hasHashMarks: false,
    hasNumbers: false,
    flagMarkers: { distanceFromGoal: 5, length: 2 },
  },
};

const Field: React.FC<{ type: FieldType; showNumbers: boolean; showMeters: boolean; showYards: boolean }> = ({ type, showNumbers, showMeters, showYards }) => {
  const config = fieldConfigs[type];
  const { totalLength, totalWidth, endzoneDepth } = config;

  const playingFieldLength = totalLength - 2 * endzoneDepth;
  const padding = 15;
  const techAreaTotalDepth = config.hasTechArea ? (config.techArea!.depth + config.techArea!.offset) : 0;
  
  const viewBoxWidth = totalLength + (padding * 2);
  const viewBoxHeight = totalWidth + (padding * 2) + (techAreaTotalDepth * 2);
  const viewBox = `-${padding} -${padding + techAreaTotalDepth} ${viewBoxWidth} ${viewBoxHeight}`;
  
  const YardLineNumbers = ({ side }: { side: 'top' | 'bottom' }) => {
    if (!config.hasNumbers || !showNumbers) return null;
    
    const lines = [10, 20, 30, 40, 50];
    const yPos = side === 'top' ? config.numberOffset! : totalWidth - config.numberOffset!;
    const rotation = side === 'top' ? -90 : 90;

    return (
      <g fill="white" fontSize="4" textAnchor="middle" dominantBaseline="middle">
        {lines.map((lineNumber) => {
          const actualYardLine = lineNumber <= 50 ? lineNumber : 100 - lineNumber;
          const xPos = endzoneDepth + lineNumber;
          const xPosMirrored = totalLength - endzoneDepth - lineNumber;
          return (
            <React.Fragment key={`num-${lineNumber}`}>
              {lineNumber !== 50 && (
                 <>
                  {/* First half */}
                  <text x={xPos} y={yPos} transform={`rotate(${rotation} ${xPos} ${yPos})`}>
                    {actualYardLine}
                  </text>
                  {/* Mirrored half */}
                  <text x={xPosMirrored} y={yPos} transform={`rotate(${rotation} ${xPosMirrored} ${yPos})`}>
                    {actualYardLine}
                  </text>
                 </>
              )}
               {lineNumber === 50 && (
                   <text x={totalLength / 2} y={yPos} transform={`rotate(${rotation} ${totalLength/2} ${yPos})`}>
                    {50}
                   </text>
               )}
            </React.Fragment>
          );
        })}
      </g>
    );
  };
  
  const Markings = () => {
    const elements: React.ReactElement[] = [];
    const halfPlayingField = playingFieldLength / 2;

    // Continuous Lines
    config.continuousLines.forEach((yard) => {
      const x = endzoneDepth + yard;
      elements.push(<line key={`cont-${yard}`} x1={x} y1={0} x2={x} y2={totalWidth} stroke="white" strokeWidth="0.5" />);
      if(yard !== halfPlayingField) {
        const xMirrored = totalLength - x;
        elements.push(<line key={`cont-m-${yard}`} x1={xMirrored} y1={0} x2={xMirrored} y2={totalWidth} stroke="white" strokeWidth="0.5" />);
      }
    });

    // Dashed Lines
    config.dashedLines.forEach((yard) => {
      const x = endzoneDepth + yard;
      elements.push(<line key={`dash-${yard}`} x1={x} y1={0} x2={x} y2={totalWidth} stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />);
      const xMirrored = totalLength - x;
      elements.push(<line key={`dash-m-${yard}`} x1={xMirrored} y1={0} x2={xMirrored} y2={totalWidth} stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />);
    });
    
    // Hash Marks & Number Lines
    if (config.hasHashMarks && config.hashMarkPositions) {
        const linesForHashes = [10, 20, 30, 40, 50];
        linesForHashes.forEach(yard => {
            const x = endzoneDepth + yard;
            const xMirrored = totalLength - x;

            config.hashMarkPositions!.forEach((pos, i) => {
                const y = totalWidth * pos;
                // Length 2 yards total (x-1 to x+1)
                elements.push(<line key={`hash-${yard}-${i}`} x1={x - 1} y1={y} x2={x + 1} y2={y} stroke="white" strokeWidth="0.5" />);
                if (yard !== 50) {
                  elements.push(<line key={`hash-m-${yard}-${i}`} x1={xMirrored - 1} y1={y} x2={xMirrored + 1} y2={y} stroke="white" strokeWidth="0.5" />);
                }
            });
            if (config.hasNumbers && config.numberOffset) {
              const yTop = config.numberOffset;
              const yBottom = totalWidth - config.numberOffset;
              // Length 2 yards total (x-1 to x+1)
              elements.push(<line key={`numline-top-${yard}`} x1={x - 1} y1={yTop} x2={x + 1} y2={yTop} stroke="white" strokeWidth="0.5" />);
              elements.push(<line key={`numline-bottom-${yard}`} x1={x - 1} y1={yBottom} x2={x + 1} y2={yBottom} stroke="white" strokeWidth="0.5" />);
              if(yard !== 50) {
                 elements.push(<line key={`numline-m-top-${yard}`} x1={xMirrored - 1} y1={yTop} x2={xMirrored + 1} y2={yTop} stroke="white" strokeWidth="0.5" />);
                 elements.push(<line key={`numline-m-bottom-${yard}`} x1={xMirrored - 1} y1={yBottom} x2={xMirrored + 1} y2={yBottom} stroke="white" strokeWidth="0.5" />);
              }
            }
        });
    }

    // Center Hash Mark (Master specific)
    if (config.hasCenterHashMark) {
        const centerX = totalLength / 2;
        const centerY = totalWidth / 2;
        // Length 2 yards total (x-1 to x+1)
        elements.push(<line key="center-hash" x1={centerX - 1} y1={centerY} x2={centerX + 1} y2={centerY} stroke="white" strokeWidth="0.5" />);
    }

    // Flag Markers
    if (config.flagMarkers) {
      const { distanceFromGoal, length } = config.flagMarkers;
      const x1 = endzoneDepth + distanceFromGoal;
      const x2 = totalLength - endzoneDepth - distanceFromGoal;
      const y = totalWidth / 2 - length / 2;
      elements.push(<rect key="flag-marker-1" x={x1} y={y} width="0.5" height={length} fill="white" />);
      elements.push(<rect key="flag-marker-2" x={x2} y={y} width="0.5" height={length} fill="white" />);
    }

    return <g>{elements}</g>;
  };
  
  const TechnicalAreas = () => {
    if (!config.hasTechArea || !config.techArea) return null;
    const { startYard, depth, offset } = config.techArea;
    const x = endzoneDepth + startYard;
    const width = playingFieldLength - 2 * startYard;

    return (
      <g stroke="white" strokeWidth="0.5" fill="none">
        <rect x={x} y={-offset - depth} width={width} height={depth} />
        <rect x={x} y={totalWidth + offset} width={width} height={depth} />
      </g>
    );
  }

  const Measurements = () => {
    if (!showMeters && !showYards) return null;

    const YARDS_TO_METERS = 0.9144;
    const formatLabel = (yards: number) => {
        const m = (yards * YARDS_TO_METERS).toFixed(2) + 'm';
        const y = yards + 'yd';
        if (showMeters && showYards) return `${m} / ${y}`;
        if (showMeters) return m;
        if (showYards) return y;
        return '';
    };

    const textStyle: React.SVGProps<SVGTextElement> = { fill: '#facc15', fontSize: '2.8px', textAnchor: 'middle', dominantBaseline: 'middle' };
    const lineStyle: React.SVGProps<SVGLineElement> = { stroke: '#facc15', strokeWidth: '0.25', markerStart: 'url(#arrow)', markerEnd: 'url(#arrow)'};
    const dimensionLineStyle: React.SVGProps<SVGLineElement> = { stroke: '#facc15', strokeWidth: '0.25', strokeDasharray: '1 1'};

    const elements: React.ReactElement[] = [];

    const addMeasurement = (
      value: number,
      p1: {x:number, y:number}, 
      p2: {x:number, y:number},
      offset: number,
      orientation: 'horizontal' | 'vertical'
    ) => {
      const key = `${p1.x}-${p1.y}-${p2.x}-${p2.y}`;
      if (orientation === 'horizontal') {
        const y = p1.y + offset;
        const textY = y + (offset > 0 ? 3 : -2);
        elements.push(<line key={`dim-l-${key}`} x1={p1.x} y1={p1.y} x2={p1.x} y2={y} {...dimensionLineStyle} />);
        elements.push(<line key={`dim-r-${key}`} x1={p2.x} y1={p2.y} x2={p2.x} y2={y} {...dimensionLineStyle} />);
        elements.push(<line key={`line-${key}`} x1={p1.x} y1={y} x2={p2.x} y2={y} {...lineStyle} />);
        elements.push(<text key={`text-${key}`} x={(p1.x + p2.x)/2} y={textY} {...textStyle}>{formatLabel(value)}</text>);
      } else { // vertical
        const x = p1.x + offset;
        const textX = x + (offset > 0 ? 4 : -2.5);
        elements.push(<line key={`dim-t-${key}`} x1={p1.x} y1={p1.y} x2={x} y2={p1.y} {...dimensionLineStyle} />);
        elements.push(<line key={`dim-b-${key}`} x1={p2.x} y1={p2.y} x2={x} y2={p2.y} {...dimensionLineStyle} />);
        elements.push(<line key={`line-${key}`} x1={x} y1={p1.y} x2={x} y2={p2.y} {...lineStyle} />);
        elements.push(<text key={`text-${key}`} x={textX} y={(p1.y + p2.y)/2} transform={`rotate(90 ${textX} ${(p1.y + p2.y)/2})`} {...textStyle}>{formatLabel(value)}</text>);
      }
    };

    // Main dimensions
    addMeasurement(totalLength, {x: 0, y: 0}, {x: totalLength, y: 0}, -padding/2, 'horizontal');
    addMeasurement(totalWidth, {x: totalLength, y: 0}, {x: totalLength, y: totalWidth}, padding/2, 'vertical');
    addMeasurement(playingFieldLength, {x: endzoneDepth, y: totalWidth}, {x: totalLength - endzoneDepth, y: totalWidth}, padding/2.5, 'horizontal');
    addMeasurement(endzoneDepth, {x:0, y:totalWidth/4}, {x:endzoneDepth, y:totalWidth/4}, -4, 'horizontal');
    
    // Tech Area dimensions
    if (config.hasTechArea && config.techArea) {
      const { startYard, depth, offset } = config.techArea;
      const x = endzoneDepth + startYard;
      const width = playingFieldLength - 2 * startYard;
      const textX = x + width / 2;
      
      elements.push(<text key="tech-area-top-text" x={textX} y={-offset - depth / 2} {...textStyle}>{formatLabel(width)}</text>);
      elements.push(<text key="tech-area-bottom-text" x={textX} y={totalWidth + offset + depth / 2} {...textStyle}>{formatLabel(width)}</text>);

      addMeasurement(depth, {x: x+width, y: -offset-depth}, {x: x+width, y: -offset}, 4, 'vertical');
    }

    // Hash Mark width dimensions
    if (config.hasHashMarks && config.hashMarkPositions && config.hashMarkPositions.length >= 2) {
      const measureX = totalLength - endzoneDepth + 5; // Position lines slightly right of the goal line
      const hashY1 = totalWidth * config.hashMarkPositions[0];
      const hashY2 = totalWidth * config.hashMarkPositions[1];

      const distSidelineToHash = totalWidth * config.hashMarkPositions[0];
      const distBetweenHashes = totalWidth * (config.hashMarkPositions[1] - config.hashMarkPositions[0]);
      const distHashToSideline = totalWidth * (1 - config.hashMarkPositions[1]);

      addMeasurement(distSidelineToHash, {x: measureX, y: 0}, {x: measureX, y: hashY1}, 4, 'vertical');
      addMeasurement(distBetweenHashes, {x: measureX, y: hashY1}, {x: measureX, y: hashY2}, 4, 'vertical');
      addMeasurement(distHashToSideline, {x: measureX, y: hashY2}, {x: measureX, y: totalWidth}, 4, 'vertical');
    }
    
    // Number line width dimensions
    if (config.hasNumbers && config.numberOffset) {
      const measureX = endzoneDepth - 5;
      const yTop = config.numberOffset;
      const yBottom = totalWidth - config.numberOffset;
      const distBetween = totalWidth - 2 * config.numberOffset;

      addMeasurement(config.numberOffset, {x: measureX, y: 0}, {x: measureX, y: yTop}, -4, 'vertical');
      addMeasurement(distBetween, {x: measureX, y: yTop}, {x: measureX, y: yBottom}, -4, 'vertical');
      addMeasurement(config.numberOffset, {x: measureX, y: yBottom}, {x: measureX, y: totalWidth}, -4, 'vertical');
    }

    // Half Width dimensions (All Categories)
    const halfWidth = totalWidth / 2;
    const halfWidthMeasureX = 0;
    addMeasurement(halfWidth, {x: halfWidthMeasureX, y: 0}, {x: halfWidthMeasureX, y: halfWidth}, -6, 'vertical');
    addMeasurement(halfWidth, {x: halfWidthMeasureX, y: halfWidth}, {x: halfWidthMeasureX, y: totalWidth}, -6, 'vertical');

    return <g>{elements}</g>;
  };

  return (
    <div className="w-full h-full">
      <svg
        viewBox={viewBox}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#facc15" />
          </marker>
        </defs>
        
        {/* Field Color */}
        <rect
          x="0"
          y="0"
          width={totalLength}
          height={totalWidth}
          fill="#0a5d27"
        />
        {/* Endzones */}
        <rect x="0" y="0" width={endzoneDepth} height={totalWidth} fill="#06421c" fillOpacity="0.7"/>
        <rect x={totalLength - endzoneDepth} y="0" width={endzoneDepth} height={totalWidth} fill="#06421c" fillOpacity="0.7"/>

        {/* Boundary Lines */}
        <rect
          x="0"
          y="0"
          width={totalLength}
          height={totalWidth}
          fill="none"
          stroke="white"
          strokeWidth="0.5"
        />
        {/* Goal Lines */}
        <line x1={endzoneDepth} y1={0} x2={endzoneDepth} y2={totalWidth} stroke="white" strokeWidth="0.5"/>
        <line x1={totalLength - endzoneDepth} y1={0} x2={totalLength - endzoneDepth} y2={totalWidth} stroke="white" strokeWidth="0.5"/>

        <Measurements />
        <Markings />
        <TechnicalAreas />
        <YardLineNumbers side="top" />
        <YardLineNumbers side="bottom" />
      </svg>
    </div>
  );
};

export default Field;
