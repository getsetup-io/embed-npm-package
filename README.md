# GSU Embedded Shell

This package is intended for partners of GetSetUp to include into their build processes. It will inject GetSetUp embedded content into the partner's site using iframes.

## Installing

```sh
npm i @getsetup/embed
```

## Versioning

This package follows [semver](https://semver.org/).

## Quick Start Example

```ts
import * as GSU from '@getsetup/embed'

// Read partner id from query string or hardode it
const searchParams = new URLSearchParams() // Please feel free to use framework specific equivalent functions here for e.g. React has useSearchParams().
const partnerId = searchParams.get('partner-id') || 'gsu-demo'

// This function is supplied by the hosting page.
// They should preform any checking and sanitation they wish to here.
const navigationCallBack = ({
  navigationAction,
  classId,
  classSlug,
}: {
  navigationAction: GSU.NavigationAction
  classId?: string
  classSlug?: string
}) => {
  const targetUrl = new URL(window.location.href)
  // The 'watch' navigation action is special because we need to pass the classId to the 'watch' page.
  if (navigationAction === 'watch' && classId) {
    targetUrl.pathname = `/hostSitePath/watch/${classSlug ?? ''}`
    targetUrl.searchParams.set('class-id', classId ?? '')
  } else if (navigationAction === 'discover') {
    targetUrl.pathname = '/hostSitePath/discover'
    targetUrl.searchParams.set('partner-id', partnerId)
    targetUrl.searchParams.delete('class-id')
  }
  window.location.assign(targetUrl)
}

// Token exchange is handled on a case-by-case basis. Pass this if it's not to be implemented.
const tokenRequestCallBack = () => {}

GSU.createIframe({
  targetElementId: 'id-of-target-element',
  targetPage: 'discover', // or 'watch'
  partnerId,
  navigationCallBack,
  tokenRequestCallBack,
})
```

## Using The Package

The package exposes one function: `GSU.createIframe(options)`. This function will create an iframe in the host page and create the event listeners needed for `postMessage` communication with the iframe.

### Options

The `GSU.createIframe` function takes an options object as its single argument. The TypeScript interface for that options object is as follows:

```ts
export type TargetPage = 'discover' | 'watch'
export type NavigationAction = 'discover' | 'watch' | 'login' | 'home' | 'help'

export enum IframeStatus {
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
export interface IframeStatusMessage {
  /** The current status of the iframe. */
  status: IframeStatus
  /** A text message to inform developers or monitoring. This should not be shown to users. */
  message: string
}

export interface CreateIframeOptions {
  /** The children of this target element will be replaced with the iframe embedded GetSetUp content. */
  targetElementId: string

  /** Which GetSetUp Page to display in the iframe. */
  targetPage: TargetPage // "discover" | "watch"

  /** The id of the class to play. Required if the `targetPage` is `watch`. */
  classId?: string

  /** The id of your organisation as issued to you by GetSetUp. */
  partnerId?: string

  /** A flag for disabling the chat tab on the `watch` page. */
  disableChat?: boolean

  /** A flag for disabling the help link on the `watch` page. */
  disableHelp?: boolean

  /**
   * You should provide this optional function if you want to change the URL of the hosting page when the iframe needs to navigate.
   *
   * This function is called when the iframe needs to navigate the top level URL.
   * E.G: to go from `hostsite.com/online-classes/catalogue` to `hostsite.com/online-classes/watch-video/98hsfnb498ywh4`
   * @param navigationAction The page to navigate to. If this is `login` the parent page should start a login flow and redirect the user to the current page once they are logged in.
   * @param classId If the page is the watch page, then classId must be passed back to the createIframe function on the new page.
   * @param classSlug If the page is the watch page, then the classSlug will be sent to this callback. The classSlug is only for SEO use on the parent page, it is not required to be passed back to the createIframe function.
   *
   * If this function is not provided then the iframe will perform navigations internally without informing the parent page.
   */
  navigationCallBack?: ({
    navigationAction,
    classId,
    classSlug,
  }: {
    navigationAction: NavigationAction
    classId?: string
    classSlug?: string
  }) => void

  /**
   * This function is called when the iframe needs a token.
   * This will happen on page load and when the current token expires.
   * This function is optionally async, it can either return the token, or a promise that will resolve to the token.
   * @returns Either a JWE compact token that contains user identification or a promise that will resolve to the token. If no token is available then this function can return `null | undefined` or an empty promise. */
  tokenRequestCallBack?: () => Promise<string | null | undefined | void> | string | null | undefined | void

  /**
   * This is called by the iframe loading script when the status of the iframe changes. It is used to inform the page the embeds the iframe whether the iframe loaded successfully or not.
   * @param iframeStatusMessage An `IframeStatusMessage` containing a `status` and a `message` field.
   */
  statusCallBack?: (iframeStatusMessage: IframeStatusMessage) => void

  /**
   * Optional - Used to construct links inside the iframe that point to the hosting site. Navigation is still accomplished via the `navigationCallBack`.
   * These links just allow bots to crawl the content for better SEO. Only Supported on premium plans.
   *
   */
  linkTemplates?: {
    /**
     * This template should be the URL you wish the browse pages to link to on your site. The tokens `{classSlug}` and `{sessionId}` are replaced with their values.
     * For example: `https://example.com/classes/{classSlug}/{sessionId}` could become `https://example.com/classes/cooking-with-rice/83bas8dfba`.
     */
    joinClass?: string
    /**
     * This template should be the URL of the learn page on your site.
     * For example: `https://example.com/online-classes/learn/`.
     */
    learnPage?: string
    /**
     * This template should be the URL of the fitness page on your site.
     * For example: `https://example.com/online-classes/fitness/`.
     */
    fitnessPage?: string
    /**
     * This template should be the URL of the fitness page on your site.
     * For example: `https://example.com/online-classes/discover/`.
     */
    discoverPage?: string
    /**
     * This template should be the URL of the fitness page on your site.
     * For example: `https://example.com/online-classes/watch/`.
     */
    watchPage?: string
  }

  /**
   * Optional - Allows the caller to override urls that will be loaded in the iframe. Used for testing.
   */
  targetUrls?: {
    discover: string
    watch: string
  }

  /**
   * Optional - Allows the caller to override the loading timeout that displays an error message if the iframe doesn't load in time.
   * This value is in milliseconds.
   */
  loadingTimeoutInMs?: number

  /**
   * A set of options to allow the caller to control the theme rendered inside the iframe.
   * More options will be added to this over time.
   */
  themeOptions?: {
    /** This image will be displayed in the side bar of the `joinClass` page. */
    logoUrl?: string
  }

  /** Information used to report analytics back to your organisation. */
  analyticsInfo?: {
    /** The domain of the site that is hosting the embed. */
    domain?: string
    /** A stable id for the device the user is using to access the parent page. */
    deviceId?: string
  }
}
```

- `targetElementId` (REQUIRED): The id of the element on the host page. The iframe will be created inside that element.
- `targetPage` (REQUIRED): The GetSetUp page to render inside the iframe. One of `"discover"` or `"watch"`.
- `classId` (REQUIRED if `targetPage` is `watch`): A string that will be passed to the Join Class page so it knows what video to play.
- `partnerId` (REQUIRED): The id string for your organisation that was issues to you by GetSetUp. Used by GetSetUp to tailor content to your organisation.
- `deviceId` (OPTIONAL): This is an optional id used for analytics that will be reported back to your organisation.
- `disableChat` (OPTIONAL): This is an optional flag that will disable the chat tab on the `watch` page..
- `disableHelp` (OPTIONAL): This is an optional flag that will disable the help link on the `watch` page.
- `navigationCallBack` (REQUIRED if `targetPage` is `discover` | `watch`): This is used to navigate between pages on the hosting site, from class listings to the page that embeds the video of the class. It is passed the `navigationAction` (`"discover" | "watch" | "login" | "home" | "help"`) and if the `navigationAction="watch"` is also passed the `classId` and `classSlug` of the class the user wants to join. The hosting site should deal with these navigation requests as appropriate.
- `tokenRequestCallBack` (OPTIONAL): This callback is used to get a token from the hosting page. This token is used for chat authorization, so this callback is optional if you have disabled chat, otherwise this callback is required. This callback is called when the iframe loads or the current token expires. The callback must return An encrypted JWT (JWE) that was encrypted with the public key given to you by GetSetUp. That token maybe returned as a pain string, or as a string inside a promise if your token generation is async. If no token is available (E.g. the user is not logged into your site) you may return `null`, `undefined`, nothing (`void`) or a promise that resolves to any of those. Details on constructing the token are below in the [Token](#token) section.
- `statusCallBack` (OPTIONAL): This callback is called when the iframe is loading, has loaded, or errors. The object that is passed to this function has a `status` and a `message`. Both of those fields are for intended to inform developers what the iframe is doing, they SHOULD NOT be shown to users.
- `linkTemplates.joinClass` (OPTIONAL): A URL template that will be used to construct links from the embedded browse pages (learn, fitness) to the page that embeds the join class page. This is an optional convenience offered to premium partners, it doesn't effect the navigation between pages which is still handled by the `navigationCallBack`. Rather it provides a link that bots can crawl to aid with SEO. See the [link templates section](#link-templates) for more information. `linkTemplates` is an object to allow for future expansion of this concept.
- `linkTemplates.learnPage` (OPTIONAL): A URL template that will be used to construct links from one embedded browse pages (ex. fitness) to the learn page. This is an optional convenience offered to premium partners, it doesn't effect the navigation between pages which is still handled by the `navigationCallBack`. Rather it provides a link that bots can crawl to aid with SEO. See the [link templates section](#link-templates) for more information.
- `linkTemplates.fitnessPage` (OPTIONAL): A URL template that will be used to construct links from one embedded browse pages (ex. learn) to the fitness page. This is an optional convenience offered to premium partners, it doesn't effect the navigation between pages which is still handled by the `navigationCallBack`. Rather it provides a link that bots can crawl to aid with SEO. See the [link templates section](#link-templates) for more information.
- `linkTemplates.discoverPage` (OPTIONAL): A URL template that will be used to construct links from one embedded browse pages (ex. discover) to the SEO friendly url page. This is an optional convenience offered to premium partners, it doesn't effect the navigation between pages which is still handled by the `navigationCallBack`. Rather it provides a link that bots can crawl to aid with SEO. See the [link templates section](#link-templates) for more information.
- `linkTemplates.watchPage` (OPTIONAL): A URL template that will be used to construct links from one embedded watch pages to the page that embeds the watch class page. This is an optional convenience offered to premium partners, it doesn't effect the navigation between pages which is still handled by the `navigationCallBack`. Rather it provides a link that bots can crawl to aid with SEO. See the [link templates section](#link-templates) for more information.

- `targetUrls` (OPTIONAL): Allow the caller to override the the urls of the pages to be embedded. Used for testing, this should not be required in production. Is an object of the form :

```js
{
  learn: string
  fitness: string
  lobby: string
}
```

- `loadingTimeoutInMs` (OPTIONAL): Allows the caller to override the loading timeout. After this timeout expires the iframe loading is marked as failed and the script shows an error message to the user. This can lead to problems if running locally or in a testing environment, so callers can use this option to set a longer timeout if needed. It is recommended that you do not use this option in production.
- `themeOptions` (OPTIONAL): A set of options to allow the caller to control the theme rendered inside the iframe. More options will be added to this over time.
- `analyticsInfo` (OPTIONAL): Information used to report analytics back to your organisation.

#### Navigation Actions

The `navigationCallBack` is passed a `navigationAction` argument that is one of the following strings:

- `"learn"`: This indicates that the user wants to navigate to the page where you have embedded the GetSetUp _Learn_ page. For example the user clicked the back button on the _Join Class_ page.
- `"fitness"`: This indicates that the user wants to navigate to the page where you have embedded the GetSetUp _Fitness_ page. For example the user clicked the back button on the _Join Class_ page.
- `"joinClass"`: This indicates that the user wants to navigate to the page where you have embedded the GetSetUp _Join Class_ page. This happens when the user clicks a class listing on the _Learn_ or _Fitness_ pages, or if the user clicks a recommended class in the explore panel on the _Join Class_ page. In this case the `navigationCallBack` will also be passed a `sessionId` that you MUST pass back to the createIframe function to ensure the class is loaded for the user, as well as a `classSlug` that you MAY use to construct a pretty URL on the page embedding the _Join Class_.
- `"login"`: This indicates that the user wants to use the embedded chat experience on the _Join Class_ and that the parent page has not already provided a token to use. You should navigate the user to your login experience and redirect them to the page they are currently on once they are authenticated.
- `"home"`: This indicates that the user wants to navigate to the home page of the parent site. You should navigate the user as appropriate.
- `"help"`: This indicates that the user needs help. This is handled by the parent site as appropriate. You should navigate the user to your help pages, or show a dialog over the iframe, or any other response to a help request that makes sense for your site.
- `"discover"`: This indicates that the user wants to navigate to the page where you have embedded the GetSetUp _Discover_ page. For example the user clicked the back button on the _Watch_ page.
- `"watch"`: This indicates that the user wants to navigate to the page where you have embedded the GetSetUp _Watch_ page. This happens when the user clicks a class listing on the _Discover_ page, or if the user clicks a recommended class in the explore panel on the _Watch_ page. In this case the `navigationCallBack` will also be passed a `classId` that you MUST pass back to the createIframe function to ensure the class is loaded for the user, as well as a `classSlug` that you MAY use to construct a pretty URL on the page embedding the _Watch_.

### Page Layout

The iframe is created with the following styles attached:

```css
border: 'none';
width: 100%;
height: 100%;
```

#### Browse Pages

The browse pages (currently learn, fitness, and discover) are designed to take as much horizontal space as they are given. There is no fixed width to the browse pages. You can do whatever you wish with the horizontal layout of the page that embeds the browse pages. The height of the browse iframe is controlled by the GetSetUp iframe script. The iframe will send a postMessage event that the package code listens to, the package code will then set the height of the iframe to match teh height of the content inside it. So the height of the iframe for browse pages can be arbitrarily high. You should not count on any fixed height for the iframe.

#### Watch Pages

The iframe for the watch pages are designed to take up the horizontal and vertical space it is given. You should set the width and height of the element that contains the iframe (the element identified by `targetElementId`).

For example if you wanted the Join Class iframe to occupy the entire browser window you should style the container element with:

```css
overflow: hidden;
width: 100%;
height: 100vh;
```

Or if you wanted the Join Class iframe to fit a smaller space to allow other content on the page, you could style the containing element with the following:

```css
overflow: hidden;
width: 100%;
height: calc(100vh - 300px);
```

That would allow space for 150px high elements at the top and bottom of the page.

The Watch iframes should support most width/height values on the containing element, but we do not recommend values smaller than (600px, 300px) or (300px, 600px).

### Token

The token you supply to the `tokenRequestCallBack()` function must be a JSON Web Encryption (JWE) token. GetSetUp will provide you with a public key, as a JSON Web Key (JWK), that you will use to encrypt the token.

The token should be encrypted with the following settings:

- alg: `RSA-OAEP-256`
- enc: `A256GCM`

The payload of the token must contain:

- sub: The subject of the token. This should be a stable user id that you can understand if it is sent back to you in analytics reporting.
- iss: The issuer of the token. This must be the `embeddingOrgId` as issued to you by GetSetUp.
- aud: The audience for the token. This must be the string `getsetup`.
- exp: The timestamp at which this token is no longer valid. This is a JSON numeric value representing the number of seconds from 1970-01-01T00:00:00Z UTC. See [exp in RFC7519](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.4) and the [NumericDate format in the same RFC](https://www.rfc-editor.org/rfc/rfc7519#section-2)

#### Token refresh

The GetSetUp chat experience will use the token expiry time (`exp`) to determine when to check for a new token. The chat experience will ask the parent page for a new token using the `tokenRequestCallBack` 30 seconds before the token will expire. If the chat experience receives a token that is not valid it will continue to use the existing valid token it has until it expires.

The chat experience places a floor on the minimum length of time a token can be valid for. If the token is valid for less than one minute, the chat experience will treat the token as being valid for one minute. This is to prevent misconfiguration from DOSing GetSetup or, via the `tokenRequestCallBack`, the parent page with tokens that immediately expire.

When the token expires the user will be logged out of the chat experience and will have to click a button to initiate the login flow again. The chat experience will not automatically retry to get a valid token after receiving an invalid token.

An example of encrypting a token with the [jose npm package](https://www.npmjs.com/package/jose):

```ts
const publicKey = {
  /* JWK given to you by GetSetUp. */
}

const token = new jose.EncryptJWT({})
  .setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM' })
  .setIssuer('my-awesome-company') // Your embeddingOrgId
  .setAudience('getsetup')
  .setSubject('ssd8y34bn87sfgh') // The userId
  .setExpirationTime('10m') // Expire 10 minutes from now.
  .encrypt(publicKey)
```

### Link Templates

> `linkTemplates` is an object to allow for future expansion of this concept, but only the `joinClass`, `learnPage`, `fitnessPage`, `discoverPage` and `watchPage` link templates are currently supported.

The Link Template is an optional URL template passed into the `GSU.createIframe` function as a string. If present in the string, the tokens `{classSlug}` and `{classId}` are replaced with their values.

This option is designed to allow premium partners control over the links embedded on their site. Navigation between pages is handled by the `NavigationActions` passed to the [navigationCallback](#navigation-actions). The Link Template allows premium partners to control the format of links that the embedded learn and fitness pages show.

As an example, imagine the site example.com is embedded GetSetUp into it's pages. Example.com uses a path based url format and hosts the GetSetUp fitness page at `example.com/classes/fitness`. Example.com hosts the join class page at `example.com/watch` with the class slug and class id in the path, e.g. `example.com/watch/cooking-with-rice/wdf80h32b`. To achieve crawlable links on their site, example.com should pass in a linkTemplate of the form `https://example.com/watch/{classSlug}/{classId}`.

If example.com used query strings to route between embedded pages then their URLs might look like this: `example.com/watch?class-id=wdf80h32b` in which case their `linkTemplate` should be: `example.com/watch?class-id={classId}`.

Please note:

- There is no sanity checking preformed on the Link Template, it is 100% under the control of the integrating partner.
- If you require different URLs on different pages, then you can provide different `linkTemplate`s on those pages.
- Only the tokens `{classSlug}` and `{classId}` are supported in `linkTemplate`s. Anything else will be left unchanged.

### Clean Up

The `GSU.createIframe` function returns a `GSU.IframeInstance` object that has the following interface:

```TypeScript
export interface IframeInstance {
  cleanUp: () => void
}
```

The cleanUp function on this object will cancel any in flight timers and remove event listeners needed for communication between the GetSetUp content and this package. You should retain a reference to the `GSU.IframeInstance` object and call the clean up function before calling the `GSU.createIframe` function a second time.
