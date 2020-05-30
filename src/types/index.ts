/* eslint-disable @typescript-eslint/no-explicit-any */
import { DisplayObject } from 'pixi.js';

type Methods = {
  [key: string]: (...args: any) => any;
}

type DefaultObject = {
  [key: string]: any;
}

type Reactives<T> = () => { [key: string]: any & ThisType<ComponentOptions<T>> }

type Draw<T> = (c: T) => void;

export interface ComponentOptions<T> {
  name?: string;
  instance?: DisplayObject;
  created?: () => void;
  reactives?: Reactives<T> | DefaultObject;
  watch?: Methods & ThisType<ComponentOptions<T>>;
  methods?: Methods & ThisType<ComponentOptions<T>>;
  draw: Draw<T> & ThisType<ComponentOptions<T>>;
  [key: string]: any;
}
