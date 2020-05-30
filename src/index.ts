/* eslint-disable @typescript-eslint/no-explicit-any */
import { DisplayObject } from 'pixi.js'
import { observe, unobserve, observable } from '@nx-js/observer-util'

export type Methods = {
  [key: string]: (...args: any) => any;
}

export type DefaultObject = {
  [key: string]: any;
}

export type Reactives<T> = () => { [key: string]: any & ThisType<ComponentOptions<T>> }

export type Draw<T> = (c: T) => void;

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

export class GameObject<T extends DisplayObject> extends DisplayObject {
  instance: T
  observableList: { (): void }[] = []
  options: ComponentOptions<T>
  constructor (Ctor: new () => T, options: ComponentOptions<T>) {
    super()
    this.augmentDisplayObject()

    // generate pixi instance
    this.instance = new Ctor()
    // giving access to the instance on the options object
    options.instance = this.instance
    // assigning a name for pixi instance dev-tool
    this.instance.name = options.name ?? 'no-name'
    // assign context to reactives and making them available on options.
    if (options.reactives) {
      if (typeof options.reactives === 'function') {
        options.reactives = options?.reactives()
        Object.entries(options.reactives || {}).forEach(([key, value]) => {
          if (!options.reactives) return
          options[key] = value
        })
        options = observable(options)
      } else {
        throw new Error('Not a function')
      }
    }

    if (options.methods) {
      Object.entries(options.methods).forEach(([key]) => {
        if (!options.methods) return
        options[key] = options.methods[key].bind(options)
      })
    }
    // created hook
    options.created && options.created()
    // draw hook
    options.draw(this.instance)
    // watchers
    this.options = options

    this.fireWatchers()
  }

  augmentDisplayObject (): void {
    DisplayObject.prototype.destroy = () => this.destroyed()
  }

  fireWatchers (): void {
    // TODO don't dire watcher first time round
    // TODO If value is the same don't fire watcher
    // TODO enable previous value
    for (const func in this.options.watch) {
      const obs = observe(() => {
        const funcArray = func.split('.')
        const propertyInReactiveness = funcArray[0]
        const propertyToWatch = funcArray[funcArray.length - 1]
        if (typeof this.options[propertyInReactiveness] === 'object') {
          // watch object by nested properties separated by .
          this.options.watch && this.options.watch[`${propertyInReactiveness}.${propertyToWatch}`].bind(this.options)(this.options[propertyInReactiveness][propertyToWatch])
        } else {
          // console.log(this.options, propertyToWatch, this.options[propertyToWatch])
          this.options.watch && this.options.watch[func].bind(this.options)(this.options[propertyToWatch])
        }
      })
      this.observableList.push(obs)
    }
  }

  destroyed (): void {
    this.observableList.forEach(obs => unobserve(obs))
    this.observableList = []
  }

  static extend<T extends DisplayObject> (c: new () => T, options: ComponentOptions<T>): T {
    return new GameObject(c, options).instance
  }
}
