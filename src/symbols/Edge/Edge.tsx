import React, { FC, ReactElement, useMemo, useRef } from 'react';
import { EdgeData } from '../../types';
import { Label, LabelProps } from '../Label';
import { CloneElement } from 'rdk';
import classNames from 'classnames';
import { getBezierPath, getCenter } from './utils';
import { curveBundle, line } from 'd3-shape';
import css from './Edge.module.scss';

export interface EdgeProps {
  id: string;
  disabled?: boolean;
  source: string;
  sourcePort: string;
  target: string;
  targetPort: string;
  properties?: EdgeData;
  style?: any;
  sections: {
    id: string;
    endPoint: {
      x: number;
      y: number;
    };
    startPoint: {
      x: number;
      y: number;
    };
    bendPoints?: {
      x: number;
      y: number;
    }[];
  }[];
  isActive: boolean | null;
  labels?: LabelProps[];
  className?: string;

  label: ReactElement<LabelProps, typeof Label>;

  onClick?: (
    event: React.MouseEvent<SVGGElement, MouseEvent>,
    data: EdgeData
  ) => void;
  onKeyDown?: (
    event: React.KeyboardEvent<SVGGElement>,
    data: EdgeData
  ) => void;
  onEnter?: (
    event: React.MouseEvent<SVGGElement, MouseEvent>,
    node: EdgeData
  ) => void;
  onLeave?: (
    event: React.MouseEvent<SVGGElement, MouseEvent>,
    node: EdgeData
  ) => void;
  onRemove?: (edge: EdgeData) => void;
}

export const Edge: FC<Partial<EdgeProps>> = ({
  sections,
  properties,
  labels,
  className,
  id,
  isActive,
  style,
  label = <Label />,
  onClick = () => undefined,
  onKeyDown = () => undefined,
  onEnter = () => undefined,
  onLeave = () => undefined
}) => {
  const d = useMemo(() => {
    // Handle bend points that elk gives us seperately from drag points
    if (sections[0].bendPoints) {
      const points: any[] = sections
        ? [
          sections[0].startPoint,
          ...(sections[0].bendPoints || []),
          sections[0].endPoint
        ]
        : [];

      const pathFn = line()
        .x((d: any) => d.x)
        .y((d: any) => d.y)
        .curve(curveBundle.beta(1));

      return pathFn(points);
    } else {
      const pos = {
        sourceX: sections[0].startPoint.x,
        sourceY: sections[0].startPoint.y,
        targetX: sections[0].endPoint.x,
        targetY: sections[0].endPoint.y
      };

      const [centerX, centerY] = getCenter(pos);

      return getBezierPath({ ...pos, centerX, centerY });
    }
  }, [sections]);

  return (
    <g
      className={css.edge}
      tabIndex={-1}
      onClick={event => {
        event.stopPropagation();
        onClick(event, properties);
      }}
      onKeyDown={event => {
        event.stopPropagation();
        onKeyDown(event, properties);
      }}
      onMouseEnter={event => {
        event.stopPropagation();
        onEnter(event, properties);
      }}
      onMouseLeave={event => {
        event.stopPropagation();
        onLeave(event, properties);
      }}
    >
      <path
        style={style}
        className={classNames(className, css.path, { [css.active]: isActive })}
        d={d}
        markerEnd="url(#end-arrow)"
      />
      {labels?.length > 0 && labels.map((l, index) => (
        <CloneElement<LabelProps>
          element={label}
          key={index}
          {...(l as LabelProps)}
        />
      ))}
    </g>
  );
};
