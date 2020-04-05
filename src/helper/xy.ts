import { WithXY } from '../defs';

const xy2arr = ({ x, y }: WithXY) => [x, y];
const xy = ([x, y]): WithXY => ({ x, y });

export { xy, xy2arr };
