Facebook Kit
============

> Facebook Graph API JS Kit - A modern JS library for Graph API. Uses access token for working with API.


## Requirements

- Latest Browsers

## Installation

In a browser:

```html
<script src="https://unpkg.com/fb-kit/dist/fb-kit.min.js"></script>
```

Or You can install the package via npm or yarn:

**NPM:**

```bash
$ npm i -s fb-kit
```

**Yarn:**

```bash
$ yarn add fb-kit
```

## Usage

```js
import fbKit from 'fb-kit';

let opts = {
    version: 'v2.8',
    accessToken: 'User / Page / App Access Token',
    beta: false, // Optional - To make API calls to beta graph api.
    appId: '', // Optional - Used for generating login URL.
    debug: false // Debug mode for API requests.
};

const FB = new fbKit(opts);

// OR

const FB = fbKit.instance(opts);
```

## Available Methods

### getApiVersion()

> Get Graph API version
>
> **Defaults:** `v2.8`

```js
let graphApiVersion = FB.getApiVersion();
```

### setApiVersion(version)

> Set default Graph API version to use for all requests.

```js
let version = 'v2.2';

FB.setApiVersion(accessToken);
```

### getAccessToken()

> Get the access token (if previously set)
>
> **Defaults:** `null`

```js
let accessToken = FB.getAccessToken();
```

### setAccessToken(accessToken)

> Set an Access Token for all API calls.

```js
let accessToken = '';

FB.setAccessToken(accessToken);
```

### get(endpoint, params = {})

> Make `get` requests.

```js
FB.get('me')
  .then(response => {
    console.log(response)
  }).catch(error => {
    console.log(error)
  });
```

### post(endpoint, params = {})

> Make `post` requests.

```js
let message = 'Hello World!';

FB.post('me/feed', { message: message })
  .then(response => {
    console.log(response)
  }).catch(error => {
    console.log(error)
  });
```

### delete(endpoint)

> Make `delete` requests.

```js
let commentId = 12345678; // Comment ID to Delete

FB.delete(commentId)
  .then(response => {
    console.log(response)
  }).catch(error => {
    console.log(error)
  });
```

### batch(batch = [])

> Make `batch` requests.

```js
let batch = [
    { method: 'get', relative_url: '4' },
    { method: 'get', relative_url: 'me/friends?limit=50' },
    { method: 'get', relative_url: '4', headers: { 'If-None-Match': '"7de572574f2a822b65ecd9eb8acef8f476e983e1"' } }, /* etags */
    { method: 'get', relative_url: 'me/friends?limit=1', name: 'one-friend' /* , omit_response_on_success: false */ },
    { method: 'get', relative_url: '{result=one-friend:$.data.0.id}/feed?limit=5'}
]

FB.batch(batch)
  .then(response => {
    console.log(response)
  }).catch(error => {
    console.log(error)
  });
```

### getLoginUrl(opts = {})

> Generate a login OAuth URL.

```js
let loginUrl = FB.getLoginUrl({
    redirectUri: 'https://domain...',
    appId: '123456', // Optional - Default to the appId set in constructor.
    version: 'v2.8', // Optional - Default as per getApiVersion().
    scope: 'email', // Optional
    responseType: 'code' // Optional - Default: token
    display: 'pop', // Optional
    state: '123456789' // Optional
})
```

### TODO

- [ ] Add all kit methods.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Credits

- [Syed Irfaq R.](https://github.com/irazasyed)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.