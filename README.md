# Packaged plantuml.jar

This package contains a specific version of PlantUML. Using this enables managing and updating the plantuml via NPM.

It is recommended to install the platform-specific PlantUML version too so that all the dependencies are present.

## Install

* ```npm i plantuml-static```

## Use

The path to the jar file and the version is exported by the module:

```js
import plantUml from "plantuml-static";

console.log(plantUml.path);
// /tmp/test/node_modules/plantuml-static/vendor/plantuml.jar
console.log(plantUml.version);
// v1.2023.0
```

Use this when you invoke PlantUML.
