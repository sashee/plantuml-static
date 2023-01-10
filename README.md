# Packaged plantuml.jar

This package contains a specific version of PlantUML. Using this enables managing and updating the plantuml via NPM.

It is recommended to install the platform-specific PlantUML version too so that all the dependencies are present.

## Install

* ```npm i plantuml-static```

## Use

The path to the jar file is exported by the module:

```js
import plantuml from "plantuml-static";

console.log(plantuml)
```

Use this when you invoke PlantUML.
