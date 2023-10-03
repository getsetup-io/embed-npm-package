# Setup

## Site layout

For the example below we will assume a two page site. The first page will host the "discover" page that embeds a list of classes offered by GetSetUp.
The second page is the "class" page that hosts the video viewing and chat experience.

## How to install locally

In your project, run `npm install @getsetup/embed`
The next step is to import and configure the package on a couple of pages.

### Browsing page

First on a page where you want the class browsing experience create a div and setup the iframe:

```html
<div id="iframe-target"></div>
```

```ts
import * as GSU from "@getsetup/embed";

// This function is supplied by the hosting page.
// We assume a simple navigation scheme, and we will ignore classSlug for now.
// This function will be called by the GSU iframe when it needs to navigate.
const navigationCallBack = (
  navigationAction: GSU.NavigationAction,
  sessionId?: string,
  classSlug?: string
) => {
  const url = new URL(window.location.href);
  targetUrl.pathname = `/hostSitePath/${navigationAction}`

  // The 'class' navigation action is special because we need to pass the class slug to the 'class' page.
  if (navigationAction === "class" && classSlug) {
    // const url = new URL(window.location.href)
    url.searchParams.set("class-slug", classSlug);
  }
  window.location.assign(url);
};

GSU.createIframe({
  targetElementId: "iframe-target",
  targetPage: "discover",
  embeddingOrgId: "searchandnews",
  navigationCallBack,
});
```

The content of the div will be replaced with the GetSetUp iframe.

### Class page

Then on a second page where you want the user to watch the class:

```html
<div id="iframe-target"></div>
```

```ts
import * as GSU from "@getsetup/embed";

// This function is supplied by the hosting page.
// We assume a simple navigation scheme, and we will ignore classSlug for now.
// This function will be called by the GSU iframe when it needs to navigate.
const navigationCallBack = (
  navigationAction: GSU.NavigationAction,
  sessionId?: string,
  classSlug?: string
) => {
  const url = new URL(window.location.href);
  targetUrl.pathname = `/hostSitePath/${navigationAction}`

  // The 'class' navigation action is special because we need to pass the class slug to the 'class' page.
  if (navigationAction === "class" && classSlug) {
    // const url = new URL(window.location.href)
    url.searchParams.set("class-slug", classSlug);
  }
  window.location.assign(url);
};

//Get the class slug from the query string.
const urlParams = new URLSearchParams(window.location.search);
const classSlug = urlParams.get("class-slug");

GSU.createIframe({
  targetElementId: "iframe-target",
  targetPage: "class",
  embeddingOrgId: "searchandnews",
  classSlug: classSlug 
  navigationCallBack,
});
```

## Use the site

Now that both pages are setup, you can go to the page hosting the "discover" page and click on a class. The iframe will request that the hosting page navigates to the "class" page using the `navigationCallBack` we setup.
