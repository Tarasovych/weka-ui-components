import React from 'react';
import { ExtendedCellProps } from '../../../types';
import './iconCell.scss';
export interface IconCellOptions<Data> {
    Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    extraClass?: string | ((values: Data) => string);
    tooltipText?: string | ((values: Data) => string);
}
type IconCellValue = string | boolean | null | undefined;
declare function IconCell<Data>(props: ExtendedCellProps<Data, IconCellValue>): JSX.Element;
export default IconCell;
