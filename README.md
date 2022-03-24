# There-should-be-an-API

> Oh, I think this website needs an API.

Extract data-like things from a website on the fly.

## Demo

The demo API is hosted on a 256MB RAM server with limited resources, so don't expect it to be fast.

```md
https://tsbaa-jacoblincool.koyeb.app/?url=<url>
```

You can check `X-Parse-Time` header in the response to see how long it took to parse the target page.

Also, there are some other options:

- `&hash`: replace selectors with their hashes, default is `true`. _I believe the selectors of the target page are not important in most cases._
- `&mode`: `simple` or `full`, default is `simple`.
- `&min`: threshold of the minimum acceptable size of group, default is `5`.
- `&max`: threshold of the maximum acceptable size of group, default is `Infinity`.
- `&content_min`: threshold of the minimum acceptable size of text content, default is `5`.
- `&content_max`: threshold of the maximum acceptable size of text content, default is `Infinity`.

## Examples

```md
https://tsbaa-jacoblincool.koyeb.app/?url=https://ani.gamer.com.tw/animeList.php
```

```md
https://tsbaa-jacoblincool.koyeb.app/?url=https://news.google.com/topstories
```

```md
https://tsbaa-jacoblincool.koyeb.app/?url=https://github.com/trending
```
