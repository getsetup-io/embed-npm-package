# Setup

## CORS

The GetSetUp Embedded product requires some CORS configuration by GetSetUp to allow other sites access. We have configured access for https://uat-aperture.imds.tv and http://localhost:3001. If you require access for other development urls please contact mitchell@getsetup.io.

## Site layout

For the example below we will assume a two page site. The first page will host the "learn" page that embeds a list of classes offered by GetSetUp.
The second page is the "joinClass" page that hosts the video viewing and chat experience.

## How to install locally

1. Save the package to disk locally.
2. In your project, run `npm install /path/to/package/getsetup-io-embed-1.2.0.tgz`

The next step is to import and configure the package on a couple of pages.

### Browsing page

First on a page where you want the class browsing experience create a div and setup the iframe:

```html
<div id="iframe-target"></div>
```

```ts
import * as GSU from "@getsetup-io/embed";

// This function is supplied by the hosting page.
// We assume a simple navigation scheme, and we will ignore classSlug for now.
// This function will be called by the GSU iframe when it needs to navigate.
const navigationCallBack = (
  navigationAction: GSU.NavigationAction,
  sessionId?: string,
  classSlug?: string
) => {
  let href = `/hostSitePath/${navigationAction}`;

  // The 'joinClass' navigation action is special because we need to pass the sessionId to the 'joinClass' page.
  if (navigationAction === "joinClass" && sessionId) {
    href = href + `?sessionId=${sessionId}`;
  }
  window.location.href = href;
};

// Generate a JWE token using the key provided to you by GetSetUp.
// The tokenRequestCallBack is not currently optional,
// but we can return nothing if we don't need chat working.
const tokenRequestCallBack = () => {};

GSU.createIframe({
  targetElementId: "iframe-target",
  targetPage: "learn",
  embeddingOrgId: "gsudemo",
  navigationCallBack,
  tokenRequestCallBack,
  // This targetUrls object isn't necessary in production integrations, but it allows us to point to the dev environment.
  targetUrls: {
    learn: "https://embed.gsudevelopment.com/embedded/{embeddingOrgId}/learn",
    fitness:
      "https://embed.gsudevelopment.com/embedded/{embeddingOrgId}/fitness",
    joinClass: "https://lobby-embed.gsudevelopment.com/session/{sessionId}",
  },
});
```

The content of the div will be replaced with the GetSetUp iframe.

### Join Class page

Then on a second page where you want the user to watch the class:

```html
<div id="iframe-target"></div>
```

```ts
import * as GSU from "@getsetup-io/embed";

// This function is supplied by the hosting page.
// We assume a simple navigation scheme, and we will ignore classSlug for now.
// This function will be called by the GSU iframe when it needs to navigate.
const navigationCallBack = (
  navigationAction: GSU.NavigationAction,
  sessionId?: string,
  classSlug?: string
) => {
  let href = `/hostSitePath/${navigationAction}`;

  // The 'joinClass' navigation action is special because we need to pass the sessionId to the 'joinClass' page.
  if (navigationAction === "joinClass" && sessionId) {
    href = href + `?sessionId=${sessionId}`;
  }
  window.location.href = href;
};

// Generate a JWE token using the key provided to you by GetSetUp.
// The tokenRequestCallBack is not currently optional,
// but we can return nothing if we don't need chat working.
const tokenRequestCallBack = () => {};

//Get the sessionId from the query string.
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get("sessionId");

GSU.createIframe({
  targetElementId: "iframe-target",
  targetPage: "joinClass",
  embeddingOrgId: "gsudemo",
  sessionId: sessionId,
  navigationCallBack,
  tokenRequestCallBack,
  // This targetUrls object isn't necessary in production integrations, but it allows us to point to the dev environment.
  targetUrls: {
    learn: "https://embed.gsudevelopment.com/embedded/{embeddingOrgId}/learn",
    fitness:
      "https://embed.gsudevelopment.com/embedded/{embeddingOrgId}/fitness",
    joinClass: "https://lobby-embed.gsudevelopment.com/session/{sessionId}",
  },
});
```

## Use the site

Now that both pages are setup, you can go to the page hosting the "learn" page and click on a class. The iframe will request that the hosting page navigates to the "joinClass" page using the `navigationCallBack` we setup.
