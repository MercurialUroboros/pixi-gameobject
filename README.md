# Pixi-Gameobject

This project tries to solve how to build a pixi.js game without an old fashioned MVC pattern.
The aim is to create reusable components like the modern front-end frameworks are doing nowadays.
The structure of a pixi-gameobject component is greatly inspired by single-file components in VueJs.

## Installation

Use the package manager [npm] to install pixi-gameobject.

```bash
npm install pixi-gameobject
```

## Usage

Create a file named TestComponent.ts

```typescript
import { GameObject } from 'pixi-gameobject'
import { Container, Graphics } from 'pixi.js'

export default GameObject.extend(Container, {
  name: 'Test Component',
  reactives () {
    return {
      myVariable: 1
    }
  },
  draw (c) {
    const g = new Graphics()
    g.beginFill(0x0)
    g.drawCircle(0,0,100)
    g.endFill()

    c.addChild(g)
  }
})

```
You are now able to import this component
and use it like so

```typescript
import TestComponent from 'path/to/component/TestComponent.ts

/* wherever you have your container in the codebase */

container.addChild(TestComponent)

```

## Demo

https://pixi-gameobject-demo.netlify.app/

Github link

https://github.com/MercurialUroboros/pixi-gameobject-demo

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)