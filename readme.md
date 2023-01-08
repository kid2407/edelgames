# Development Setup

### Requirements

- Docker Desktop 4.10.* or higher or a local nodejs and npm installation

### With locale nodejs installation

- Go into `app/backend` and run `npm install` then `npm run dev`
- Go into `app/frontend` and run `npm install` then `npm run start`

This will start both apps in the development mode (using hot reload and less ts compiler optimization, as well as more logging).
The Frontend will be available at `http://localhost:3000/` and the backend at `http:/localhost:5000/`

### With docker

- Go into the root directory and run `docker composer up -d`

The development processes will be started automatically for you as long as the containers are running.

### Hot reload

Both parts (frontend, backend) can use a hotloading feature (automatically started, when using docker) that allows development without constant restarts.
ReactJS supports Hotloading out of the box. The Backend uses nodemon to detect and apply changes.

# Development workflow

1. Fork the repository
2. Open a feature branch in your child repository (to maintain consistency, use *git flow* or similar)
3. Make and commit your changes -> please do your fellow coders a favour and use [semantic commit messages](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716)
4. Repeat step 3
5. Finish your feature branch
6. Open a pull request for your changes in the main repository
7. Remember to drink water, stay hydrated!
8. Go to step 2

### Deployment

1. After your feature has been merged into the main repository, create a new version tag and merge the new state into the main branch
2. tbd

# Project standards

### Frontend

- Whenever possible, use class components
- Place scss files next to its component and give it the same filename (excluding the extension)

## Adding a new module (game)

Every module must have an ID following these requirements:

* Must be unique across all modules present
* Uses camelCase
* Describes the module in a recognizable way, e.g. `advancedMemory`, but not `module67251321539`

To get the module up and running, you need to create some files and add your module to the list of existing modules both in front- and backend. For the purpose of this example, we will use `advancedMemory` as our module ID

<hr>

### Backend

Create the following file and folder structure inside of `app/backend/src/modules/`:

```
├── advancedMemory
│   ├── AdvancedMemory.ts
│   ├── AdvancedmemoryGame.ts
```

**AdvancedMemory.ts**

```typescript
import ModuleInterface from "../../framework/modules/ModuleInterface";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import AdvancedMemoryGame from "./AdvancedMemoryGame";

/*
 * This singleton is used to register the game to the ModuleList
 */
class AdvancedMemory implements ModuleInterface {

    getUniqueId(): string {
        return "advancedMemory";
    }

    getGameInstance(): ModuleGameInterface {
        return new AdvancedMemoryGame();
    }

}

const advancedMemory = new AdvancedMemory();
export default advancedMemory;
```

**AdvancedMemoryGame.ts**

```typescript
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleApi from "../../framework/modules/ModuleApi";

/*
 * The actual game instance, that controls and manages the game
 */
export default class AdvancedMemoryGame implements ModuleGameInterface {

    private readonly api: ModuleApi;

    onGameInitialize(api: ModuleApi): void {
        this.api = api;
        
        // Add event listeners you want to listen to here with this.api.getEventApi().addEventHandler()
        
        this.api.getLogger().debug('Initialized game of advanced memory');
    }

}
```

Now add the exported game instance (`advancedMemory`) to the list of modules contained in `app/backend/src/modules/ModuleList.ts`

<hr>

### Frontend

Create the following file and folder structure inside of `app/frontend/src/modules/`:

```
├── advancedMemory
│   ├── AdvancedMemory.tsx
│   ├── AdvancedMemoryGame.tsx
│   ├── AdvancedMemory.scss
│   ├── preview.png
```

**AdvancedMemory.tsx**

```typescript jsx
import ModuleInterface from "../../framework/modules/ModuleInterface";
import preview from "./preview.png";
import AdvancedMemoryGame from "./AdvancedMemoryGame";
import {ReactNode} from "react";

/*
 * A static singleton class, that contains technical details and a render method for showing the game
 */
class AdvancedMemory implements ModuleInterface {

    getPreviewImage(): string | undefined {
        return preview;
    }

    getTitle(): string {
        return "Beispiel Chat";
    }

    getUniqueId(): string {
        return "advancedMemory";
    }

    renderGame(): ReactNode {
        return (<AdvancedMemoryGame/>);
    }

}

const advancedMemory = new AdvancedMemory();
export default advancedMemory;
```

**AdvancedmemoryGame.tsx**

```typescript jsx
import React, {ReactNode} from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleApi from "../../framework/modules/ModuleApi";
import advancedMemory from "./AdvancedMemory";

export default class AdvancedMemoryGame extends React.Component<{}, {}> implements ModuleGameInterface {

    private readonly api: ModuleApi;
    private initialized: boolean = false;

    constructor(props: any) {
        super(props);
        this.api = new ModuleApi(advancedMemory, this);
    }

    // this method is called, once the component is ready and setState can be used
    componentDidMount(): void {
        if (!this.initialized) {
            // Register event listers and/or prepared things you need when the view is ready to render via this.gameApi.addEventHandler()
            this.initialized = true;
        }
    }

    render(): ReactNode {
        return (
            <div id={"advancedMemory"}>
                <p>Add your content in here</p>
            </div>
        );
    }
}
```

**Advancedmemory.scss**
```scss
#advancedMemory {
    // Add your styles in here
}
```

**preview.png**

A preview image to be show in the game selection screen - use whatever image you deem fitting with a proper aspect ratio.
<hr>

Now add the exported game instance (`advancedMemory`) to the list of modules contained in `app/frontend/src/modules/ModuleList.tsx`
And the path to your main scss file (`Advancedmemory.scss`) to the scss file in `app/frontend/src/modules/Modules.scss`