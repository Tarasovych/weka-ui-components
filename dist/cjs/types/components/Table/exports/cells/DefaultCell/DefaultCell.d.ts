/// <reference types="react" />
import { ExtendedCell, ExtendedCellProps } from '../../../types';
import './defaultCell.scss';
export interface DefaultCellOptions<Data, Value> {
    getUrl?: (cell: ExtendedCell<Data, Value>) => string;
    openInNewTab?: boolean;
    tooltipText?: string | ((cella: ExtendedCell<Data, Value>) => string);
}
type DefaultCellValue = unknown;
declare function DefaultCell<Data>(props: ExtendedCellProps<Data, DefaultCellValue>): JSX.Element;
export default DefaultCell;
