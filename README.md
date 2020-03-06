## Reproduction

1. Run `npm i`
2. Run `npm run build`
3. Open `index.html` in Chrome and Firefox and you'll see the difference.

## Details

The entry file is `index.js` which contains only:

```js
import("./async")
```

Where `async.js` calls `document.currentScript`:

```js
console.log(document.currentScript);

document.getElementById("output").textContent = document.currentScript
  ? document.currentScript.src
  : "null";
```

After we compiled `index.js` with webpack, two files will be produce into the `dist` folder:

```
dist/
  1.js
  main.js
```

After introducing the `main.js` in `index.html`, we'll notice that in Chrome, we can see the correct script `src`:

```
$PROJECT_PATH/dist/1.js
```

While in Firefox we got `null`.

After I did a little investigation, the only difference I found is that Firefox is treating scripts run inside a micro task the same way as those in timeout callbacks, making `document.currentScript` being evaluated as `null`. While in other browsers, it's evaluated to the expected `script` element.

Per the HTML spec:

> (document.currentScript) Returns null if the Document is not currently executing a script or SVG script element (e.g., because the running script is an event handler, or a timeout), or if the currently executing script or SVG script element represents a module script.

I'd say it's a little ambiguous about whether for micro tasks it should return null. Plus this section is labelled as "non-normative". But it's indeed unexpected that browsers handle this differently.

Though it's a potential bug on the Firefox side, but I think we have a chance to fix this on the webpack side.

When webpack generates an async chunk, we can evaluate `document.currentScript` synchronously upfront, and save it to a private variable like `__webpack_current_script__` so that if developers have a chance to work this around by try accessing `__webpack_current_script__` instead of `document.currentScript`.