/// <reference types="react" />
import { ExtendedCellProps } from '../../../types';
import './statusCell.scss';
export interface StatusCellOptions<Data> {
    getTooltip?: (rowValues: Data) => string;
    showString?: boolean;
}
type StatusCellValue = string | null;
declare function StatusCell<Data>(props: ExtendedCellProps<Data, StatusCellValue>): JSX.Element;
export default StatusCell;
