import * as d3 from 'd3';
export interface PriceData {
  date: string;
  value: number;
}

export interface ChartDimensions {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ChartAxes {
  xAxis: d3.Axis<any>;
  yAxis: d3.Axis<any>;
}

export interface ProcessedData {
  date: Date;
  value: number;
}

export interface ChartScales {
  x: d3.ScaleTime<number, number>;
  y: d3.ScaleLinear<number, number>;
}
