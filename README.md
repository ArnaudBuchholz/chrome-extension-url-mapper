# URL Mapper for Chrome

A Chrome extension to map URL created and maintained by
[Arnaud Buchholz](http://gpf-js.blogspot.com/).

## Purpose

The tool was created to solve a server configuration issue. I wanted to be able to load the application with
different components without changing the web server mappings (because I could not).
With this tool, you can configure the browser to substitute URLs before the content is fetched.

## Features

Define JSON configuration files containing mappings, basic syntax is:

```javascript
{
    "name": "Sample file",
    "mappings": [{
        url: "http://localhost/bin/online.aspx",
        block: true
    }, {
        url: "http://localhost/resource/logo.jpg",
        redirect: "file:///C:/My%20Project/resource/logo-debug.jpg"
    }, {
        match: "http://localhost/scripts/(.*)",
        redirect: "file:///C:/My%20Project/$1"
    }]
}
```

Use [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) to
match URLs. Matching groups can be reused in the mapped URL.
For instance:
http://localhost/scripts/(.*)=file:///C:/My%20Project/$1

## Security consideration


## Resources

Graphics based on [48 Bubbles](https://www.iconfinder.com/iconsets/48-bubbles) icons
from [IconFinder](https://www.iconfinder.com/)
