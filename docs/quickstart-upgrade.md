# Setup

## CORS & CSP

The GetSetUp Embedded product requires some CORS and CSP configuration by GetSetUp to allow other sites access. We have configured access for http://localhost:3001. If you require access for other development urls please contact engineering@getsetup.io.

## Site layout

For the example below we will assume a two page site. The first page will host the "discovery" page that embeds a list of classes offered by GetSetUp.
The second page is the "watch" page that hosts the video viewing and chat experience.

## How to install locally

In your project, run `npm install @getsetup/embed`
The next step is to import and configure the package on a couple of pages.

### Discovery page

First on a page where you want the class browsing experience create a div and setup the iframe:

```html
<div id="iframe-target"></div>
```

```ts
import * as GSU from '@getsetup/embed'

// Read partner id from query string or hardode it
const searchParams = new URLSearchParams() // Please feel free to use framework specific equivalent functions here for e.g. React has useSearchParams().
const partnerId = searchParams.get('partner-id') || 'OD3rF3b8P'

// This function is supplied by the hosting page.
// This function will be called by the GSU iframe when it needs to navigate.
const navigationCallBack = ({
  navigationAction,
  classId,
}: {
  navigationAction: GSU.NavigationAction
  classId?: string
}) => {
  const targetUrl = new URL(window.location.href)
  // The 'watch' navigation action is special because we need to pass the classId to the 'watch' page.
  if (navigationAction == 'watch' && classId) {
    targetUrl.pathname = '/hostSitePath/watch'
    targetUrl.searchParams.set('class-id', classId ?? '')
  } else if (navigationAction == 'discover') {
    targetUrl.pathname = '/hostSitePath/discover'
    targetUrl.searchParams.set('partner-id', partnerId)
    targetUrl.searchParams.delete('class-id')
  }
  window.location.assign(targetUrl)
}

// Token exchange is not yet implemented with the embed webapp and not required in case of most of the partners
const tokenRequestCallBack = () => {}

GSU.createIframe({
  targetElementId: 'iframe-target',
  targetPage: 'discover',
  partnerId,
  navigationCallBack,
  tokenRequestCallBack,
  // This targetUrls object isn't necessary in production integrations, but it allows us to point to the dev environment.
  targetUrls: {
    discover: 'https://embed-webapp.www.gsudevelopment.com/discovery/{partnerId}',
    watch: 'https://embed-webapp.www.gsudevelopment.com/watch/{partnerId}/{classId}',
  },
})
```

The content of the div will be replaced with the GetSetUp iframe.

### Watch page

Then on a second page where you want the user to watch the class:

```html
<div id="iframe-target"></div>
```

```ts
import * as GSU from '@getsetup/embed'

// Read class id and partner id from query string or hardode it
const searchParams = new URLSearchParams() // Please feel free to use framework specific equivalent functions here for e.g. React has useSearchParams().
const classId = searchParams.get('class-id') || ''
const partnerId = searchParams.get('partner-id') || 'OD3rF3b8P'

// This function is supplied by the hosting page.
// This function will be called by the GSU iframe when it needs to navigate.
const navigationCallBack = ({
  navigationAction,
  classId,
}: {
  navigationAction: GSU.NavigationAction
  classId?: string
}) => {
  const targetUrl = new URL(window.location.href)
  // The 'watch' navigation action is special because we need to pass the classId to the 'watch' page.
  if (navigationAction == 'watch' && classId) {
    targetUrl.pathname = '/hostSitePath/watch'
    targetUrl.searchParams.set('class-id', classId ?? '')
  } else if (navigationAction == 'discover') {
    targetUrl.pathname = '/hostSitePath/discover'
    targetUrl.searchParams.set('partner-id', partnerId)
    targetUrl.searchParams.delete('class-id')
  }
  window.location.assign(targetUrl)
}

// Token exchange is not yet implemented with the embed webapp and not required in case of most of the partners
const tokenRequestCallBack = () => {}

GSU.createIframe({
  targetElementId: 'iframe-target',
  targetPage: 'watch',
  classId: classId,
  partnerId,
  navigationCallBack,
  tokenRequestCallBack,
  // This targetUrls object isn't necessary in production integrations, but it allows us to point to the dev environment.
  targetUrls: {
    discover: 'https://embed-webapp.www.gsudevelopment.com/discovery/{partnerId}',
    watch: 'https://embed-webapp.www.gsudevelopment.com/watch/{partnerId}/{classId}',
  },
})
```

## Use the site

Now that both pages are setup, you can go to the page hosting the "discover" page and click on a class. The iframe will request that the hosting page navigates to the "watch" page using the `navigationCallBack` we setup.
