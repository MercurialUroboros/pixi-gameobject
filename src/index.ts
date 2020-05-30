import { DisplayObject } from 'pixi.js'
import { observe, unobserve, observable } from '@nx-js/observer-util'
import { ComponentOptions } from './types/index'

export class GameObject<T extends DisplayObject> extends DisplayObject {
  readonly instance: T
  private observableList: { (): void }[] = []
  private options: ComponentOptions<T>
  constructor (Ctor: new () => T, options: ComponentOptions<T>) {
    super()
    this.augmentDisplayObject()

    // Generate pixi instance throught ctor.
    this.instance = new Ctor()

    // Assign name from component options if used
    this.instance.name = options.name ?? 'no-name'

    // Assign options context to reactives properties and making them available on options under this keyword
    if (options.reactives) {
      if (typeof options.reactives === 'function') {
        options.reactives = options.reactives.bind(options)()
        Object.entries(options.reactives || {}).forEach(([key, value]) => {
          if (!options.reactives) return
          options[key] = value
        })
        options = observable(options)
      } else {
        throw new Error('Reactives should be a function which returns an object')
      }
    }

    // Assign this context to methods and making them available on options under this keyword
    if (options.methods) {
      Object.entries(options.methods).forEach(([key]) => {
        if (!options.methods) return
        options[key] = options.methods[key].bind(options)
      })
    }

    // Fire created hook if exists
    options.created && options.created()

    // Fire draw hook 
    options.draw(this.instance)

    // Store copy of options
    this.options = options

    this.fireWatchers()
  }

  private augmentDisplayObject (): void {
    DisplayObject.prototype.destroy = () => this.destroyed()
  }

  private fireWatchers (): void {
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

  private destroyed (): void {
    this.observableList.forEach(obs => unobserve(obs))
    this.observableList = []
  }

  static extend<T extends DisplayObject> (c: new () => T, options: ComponentOptions<T>): T {
    return new GameObject(c, options).instance
  }
}
