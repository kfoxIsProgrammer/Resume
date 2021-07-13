Wanted to set the name of a function? Or the expected number of arguments? The `function` module provides utilities to do these kinds of things.

# Documentation

Documentation for 0.6.1 can be found [here](https://mickvangelderen.github.io/function/0.6.1/ "Documentation for 0.6.1").

# Contributing

Here is some information in case you would like to contribute to this project.

## Organization

The source code for this package lives in the root of the repository. The package is [built](scripts/build-release.js) to the `release/` directory which is ignored by git. The `package.json` along with some other files are also built to the `release/` directory. This architecture allows us to have code at the root of the repository even if we are transpiling it.

## Publishing

To publish a new version of this package you need to update its version, build it and publish it. This procedure is usually done with the following commands.

```bash
npm version patch
cd release/
npm publish
```
