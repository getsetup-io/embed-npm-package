import { errorHtml } from './error.html'

// We use a version file, and not the package.json because using the package.json changes the root of the dist package.
// We need everything inside src, plus we don't need the whole package.json in the build output. Smaller is better.
import { version } from './version.json'

const targetPageUrls = {
  learn: 'https://embed.getsetup.io/embedded/{embeddingOrgId}/learn',
  fitness: 'https://embed.getsetup.io/embedded/{embeddingOrgId}/fitness',
  joinClass: 'https://lobby-embed.getsetup.io/session/{sessionId}',
}

const navigationActions = {
  ...targetPageUrls,
  // No one should ever see these messages, we only care about the keys in this object. But just in case...
  login: 'Error, the hosting page should handle login navigation actions.',
  home: 'Error, the hosting page should handle homepage navigation actions.',
  help: 'Error, the hosting page should handle help navigation actions.',
}

export type NavigationAction = keyof typeof navigationActions
export type TargetPage = keyof typeof targetPageUrls
export const GSUNavigation = 'gsuNavigation'

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

export interface NavigationCallBacks {
  /**
   * This function is called when the iframe needs to navigate to the page hosting the joinClass iframe.
   * E.G: to go from `hostsite.com/online-classes/catalogue` to `hostsite.com/online-classes/join-session/98hsfnb498ywh4`
   * @param sessionId If the page is the joinClass page, then sessionId must be passed back to the createIframe function on the new page.
   * @param classSlug If the page is the joinClass page, then the classSlug will be sent to this callback. The classSlug is only for SEO use on the parent page, it is not required to be passed back to the createIframe function.
   */
  joinClass: (sessionId?: string, classSlug?: string) => void
  /**
   * This function is called when the iframe needs to navigate to the page hosting the joinClass iframe.
   * E.G: to go from `hostsite.com/online-classes/join-session/98hsfnb498ywh4` to `hostsite.com/online-classes/learn`
   */
  learn: () => void
  /**
   * This function is called when the iframe needs to navigate to the page hosting the joinClass iframe.
   * E.G: to go from `hostsite.com/online-classes/join-session/98hsfnb498ywh4` to `hostsite.com/online-classes/fitness`
   */
  fitness: () => void
  /**
   * This function is called when the user has clicked the help button in the iframe.
   * The hosting site could navigate to a help page, or show a modal, or whatever is appropriate.
   */
  help?: () => void
  /**
   * This function is called when the user wants to login to the chat provided in the joinClass page.
   * The hosting site should log the user in and return them to the current page.
   * If this function is not supplied then chat functionally will be disabled.
   */
  login?: () => void
  /**
   * This function is called when the user has clicked the host's logo in the joinClass iframe.
   * The hosting site should navigate as appropriate.
   */
  home?: () => void
}

export interface CreateIframeOptions {
  /** The children of this target element will be replaced with the iframe embedded GetSetUp content. */
  targetElementId: string

  /** Which GetSetUp Page to display in the iframe. */
  targetPage: TargetPage

  /** The id of the class session to play. Required if the `targetPage` is `joinClass`. */
  sessionId?: string

  /** The id of your organisation as issued to you by GetSetUp. */
  embeddingOrgId: string

  /** A stable id for the device the user is using to access the parent page. Used to report analytics back to your organisation. */
  deviceId?: string

  /** A flag for disabling the chat tab on the `joinClass` page. If this is true then the `tokenRequestCallBack` is not required.
   * @deprecated If you do not supply {@link NavigationCallBacks.loginNavigation} to {@link navigationCallBacks} chat will be disabled.
   */
  disableChat?: boolean

  /**
   * This function is called when the iframe needs to navigate the top level URL.
   * E.G: to go from `hostsite.com/online-classes/catalogue` to `hostsite.com/online-classes/join-session/98hsfnb498ywh4`
   * @param navigationAction The page to navigate to. If this is `login` the parent page should start a login flow and redirect the user to the current page once they are logged in.
   * @param sessionId If the page is the joinClass page, then sessionId must be passed back to the createIframe function on the new page.
   * @param classSlug If the page is the joinClass page, then the classSlug will be sent to this callback. The classSlug is only for SEO use on the parent page, it is not required to be passed back to the createIframe function.
   * @deprecated Use the new {@link navigationCallBacks} structure instead.
   * This is optional to allow the transition from this to the `navigationCallBacks` structure. An error will be thrown if neither are supplied.
   */
  navigationCallBack?: (navigationAction: NavigationAction, sessionId?: string, classSlug?: string) => void

  /**
   * A set of callbacks that the iframe uses to ask the hosting page to navigate in response to user's actions.
   * This is optional to allow the transition from the {@link navigationCallBack} to this. An error will be thrown if neither are supplied.
   */
  navigationCallBacks?: NavigationCallBacks

  /**
   * This function is called when the iframe needs a token.
   * This will happen on page load and when the current token expires.
   * This function is optionally async, it can either return the token, or a promise that will resolve to the token.
   * @returns Either a JWE compact token that contains user identification or a promise that will resolve to the token. If no token is available then this function can return `null | undefined` or an empty promise.
   */
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
  }

  /** Optional - Allows the caller to override urls that will be loaded in the iframe. Used for testing. */
  targetUrls?: typeof targetPageUrls

  /**
   * Optional - Allows the caller to override the loading timeout that displays an error message if the iframe doesn't load in time.
   * This value is in milliseconds.
   */
  loadingTimeoutInMs?: number
}

export interface IframeInstance {
  cleanUp: () => void
}

/** These fields are all optional `any`s because we can't trust the event data to be correct, we must verify. */
interface EventFromIframe {
  origin: string
  data: {
    gsuIframeLoaded?: boolean
    gsuDocumentHeight?: any
    gsuNavigation?: {
      targetPage?: any
      sessionId?: any
      classSlug?: any
    }
    gsuAnchorNavigation?: any
    gsuTokenRequest?: any
  }
}

/**
 * Creates an iframe to embed GetSetUp content in the host page.
 * @param CreateIframeOptions - An options object containing fields as described in the CreateIframeOptions interface.
 * @returns An `IframeInstance` object with a `cleanUp()` function that can be used to clean up timers and event listeners before recreating the iframe.
 */
export function createIframe({
  targetElementId,
  targetPage,
  sessionId,
  embeddingOrgId,
  deviceId,
  disableChat,
  navigationCallBack,
  navigationCallBacks,
  tokenRequestCallBack,
  statusCallBack,
  linkTemplates,
  targetUrls,
  loadingTimeoutInMs,
}: CreateIframeOptions): IframeInstance {
  if (targetPage == 'joinClass' && !sessionId) {
    throw new Error('sessionId is required if you are loading a join class page.')
  }
  if (!Object.keys(targetPageUrls).includes(targetPage)) {
    throw new Error('The targetPage should be one of "learn" | "fitness" | "joinClass".')
  }

  const targetPages = targetUrls ?? targetPageUrls
  const normalisedOrgId = embeddingOrgId.toLowerCase()
  targetPages.learn = targetPages.learn.replace('{embeddingOrgId}', normalisedOrgId)
  targetPages.fitness = targetPages.fitness.replace('{embeddingOrgId}', normalisedOrgId)
  targetPages.joinClass = targetPages.joinClass.replace('{embeddingOrgId}', normalisedOrgId)
  if (sessionId) {
    targetPages.joinClass = targetPages.joinClass.replace('{sessionId}', sessionId)
  }

  const targetElement = document.getElementById(targetElementId)
  if (!targetElement)
    throw new Error(`GSU Embedded Shell cannot find the targetElement ${targetElementId} to mount the iframe.`)

  const gsuEmbeddedIframe = document.createElement('iframe')

  const iframeSrc = new URL(targetPages[targetPage])
  iframeSrc.searchParams.append('embedding-org-id', normalisedOrgId)
  if (deviceId) iframeSrc.searchParams.append('device-id', deviceId)
  if (disableChat) iframeSrc.searchParams.append('disable-chat', 'true')

  // Pass the join class link template to allow the page to construct hosting site links for SEO.
  if (linkTemplates?.joinClass) iframeSrc.searchParams.append('link-template-join-class', linkTemplates?.joinClass)

  const tellHostingPageIframeStatus = errorReporter({
    statusCallBack,
    iframeSrc,
    createIframeOptions: {
      targetElementId,
      targetPage,
      sessionId,
      embeddingOrgId,
      targetUrls,
      loadingTimeoutInMs,
    },
  })

  gsuEmbeddedIframe.setAttribute('src', iframeSrc.toString())

  let hasLoadedSuccessfully = false

  const handleNotLoading = (message?: string): void => {
    if (!hasLoadedSuccessfully) {
      //Fire the status callback with an error message.
      tellHostingPageIframeStatus({
        status: IframeStatus.ERROR,
        message: message ?? 'The GetSetUp iframe did not load successfully.',
      })
      gsuEmbeddedIframe.setAttribute('srcdoc', errorHtml)
    }
    clearTimeout(loadingTimeout)
  }

  const loadingTimeoutThreshold = loadingTimeoutInMs ?? 60000
  const handleTimeout = (): void => {
    return handleNotLoading('The GetSetUp iframe timed out.')
  }
  const loadingTimeout = setTimeout(handleTimeout, loadingTimeoutThreshold)

  // Try to load the head so we know if the page is working.

  fetch(iframeSrc, { method: 'HEAD', mode: 'cors' })
    .then((response) => {
      if (!response.ok) handleNotLoading('HEAD Response was not ok.')
    })
    .catch((error) => {
      const errorMessage = error.message ?? error
      handleNotLoading(`HEAD Response errored. ${errorMessage}`)
    })

  // See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox for info about sandboxing iframes.
  // We need:
  // * allow-scripts - so our js runs.
  // * allow-same-origin - otherwise our postMessage messages do not have an origin attached, and we would like to check the origin of messages.
  gsuEmbeddedIframe.setAttribute('sandbox', 'allow-scripts allow-same-origin')
  gsuEmbeddedIframe.setAttribute('allow', 'fullscreen; autoplay;')
  gsuEmbeddedIframe.setAttribute('allowfullscreen', '') // To support Firefox and Safari.
  gsuEmbeddedIframe.setAttribute('scrolling', 'no')

  gsuEmbeddedIframe.style.width = '100%'
  gsuEmbeddedIframe.style.border = 'none'
  gsuEmbeddedIframe.style.height = '100%'
  gsuEmbeddedIframe.style.minHeight = '300px'

  if (targetElement.replaceChildren) {
    targetElement.replaceChildren(gsuEmbeddedIframe)
  } else {
    // Support older browsers.
    // https://caniuse.com/?search=replaceChildren
    targetElement.innerHTML = ''
    targetElement.appendChild(gsuEmbeddedIframe)
  }

  tellHostingPageIframeStatus({
    status: IframeStatus.LOADING,
    message: 'The GetSetUp iframe is currently loading.',
  })

  const originsFromTargetUrls = Object.entries(targetPages).map(([_key, value]) => new URL(value).origin)

  // We have to add the parent page to the list because the origin of messages from srcdoc is the parent page, not the iframe.
  const currentHost = window.location.origin
  const validMessageOrigins = [
    currentHost,
    // And any other origins that were passed in.
    ...originsFromTargetUrls,
  ]

  // We currently assume that there is one iframe on the page and only check for gsu* properties in the event.
  // If we have more iframes we will have to identify them somehow.
  const messageHandler = (event: EventFromIframe): void => {
    // Only allow messages from our own iframes.
    if (validMessageOrigins.includes(event.origin)) {
      if (event.data.gsuIframeLoaded) {
        // We got a message from the JS running in the HTML head of the iframe content, so we know the page is downloading and executing.
        if (!hasLoadedSuccessfully) {
          //We only want to fire this callback once when the page first loads.
          tellHostingPageIframeStatus({
            status: IframeStatus.SUCCESS,
            message: 'The GetSetUp iframe loaded successfully.',
          })
        }
        hasLoadedSuccessfully = true
      } else if (event.data.gsuDocumentHeight) {
        // Responsive styling, but the joinClass page doesn't need it, that handles sizing a different way.
        if (targetPage != 'joinClass') gsuEmbeddedIframe.style.height = `${event.data.gsuDocumentHeight}px`

        if (!hasLoadedSuccessfully) {
          // We only want to fire this callback once when the page first loads.
          // We are leaving this here for now, but a future version will remove this call and rely on the above gsuIframeLoading message.
          tellHostingPageIframeStatus({
            status: IframeStatus.SUCCESS,
            message: 'The GetSetUp iframe loaded successfully.',
          })
        }
        hasLoadedSuccessfully = true
      } else if (event.data.gsuNavigation) {
        const pageToNavigateTo = event.data.gsuNavigation.targetPage //TODO: change this to gsuNavigation.navigationAction?
        const sessionId = event.data.gsuNavigation.sessionId
        const classSlug = event.data.gsuNavigation.classSlug
        // Make sure the page we are asking the hosting page to navigate to is a valid one of the targetPages we support.
        if (Object.keys(navigationActions).includes(pageToNavigateTo)) {
          if (navigationCallBack) {
            navigationCallBack(pageToNavigateTo, sessionId, classSlug)
          } else if (navigationCallBacks) {
            const navigationFunctionToCall = navigationCallBacks[pageToNavigateTo as NavigationAction]
            if (navigationFunctionToCall) {
              navigationFunctionToCall(sessionId, classSlug)
            }
            // TODO: throw errors if the function is undefined, meaning the page tried to call a navigation the hosting page didn't want to use.
          }
          // TODO: throw errors if the navigation callback(s) aren't supplied.
        }
      } else if (event.data.gsuAnchorNavigation) {
        // We got a request from the iframe to scroll to a location pointed to by an <a href="#sectionName">
        // But the iframe can't do that, so we scroll the parent window on it's behalf.
        const y = event.data.gsuAnchorNavigation
        window.scrollTo({ left: 0, top: y, behavior: 'smooth' })
      } else if (event.data.gsuTokenRequest) {
        // The page is asking for a token, call the token callback to get a token.
        // But the caller might have disabled chat, and not given us a tokenRequestCallBack.
        if (tokenRequestCallBack) {
          // If we wrap the callback in a Promise.resolve then we can treat the result as a promise even if we just got passed a plain string.
          Promise.resolve(tokenRequestCallBack())
            ?.then((token) => {
              if (token) {
                // Got a token, send it to the iframe.
                const messageToIframe = { gsuTokenFromHost: token }
                gsuEmbeddedIframe.contentWindow?.postMessage(messageToIframe, iframeSrc.origin)
              }
            })
            .catch((error) => {
              console.error(error)
            })
        }
      }
    }
  }

  window.addEventListener('message', messageHandler)

  return {
    cleanUp: () => {
      clearTimeout(loadingTimeout)
      window.removeEventListener('message', messageHandler)
    },
  }
}

interface ErrorReporterArguments {
  statusCallBack: ((iframeStatusMessage: IframeStatusMessage) => void) | undefined
  iframeSrc: URL
  createIframeOptions: {
    targetElementId: CreateIframeOptions['targetElementId']
    targetPage: CreateIframeOptions['targetPage']
    sessionId: CreateIframeOptions['sessionId']
    embeddingOrgId: CreateIframeOptions['embeddingOrgId']
    targetUrls: CreateIframeOptions['targetUrls']
    loadingTimeoutInMs: CreateIframeOptions['loadingTimeoutInMs']
  }
}

function errorReporter({
  statusCallBack,
  iframeSrc,
  createIframeOptions,
}: ErrorReporterArguments): (iframeStatusMessage: IframeStatusMessage) => void {
  const onError = (iframeStatusMessage: IframeStatusMessage): void => {
    if (statusCallBack) statusCallBack(iframeStatusMessage)

    if (iframeStatusMessage.status === IframeStatus.ERROR) {
      sendToSentry({
        iframeSrc,
        message: iframeStatusMessage.message,
        createIframeOptions,
      })

      // TODO: Send a sample of successful loads mostly so we can keep an eye on the timing.
      // TODO: Allow us to remotely control the sample rate? Extract a sample rate from the HEAD request?
      // } else if (iframeStatusMessage.status === IframeStatus.SUCCESS && Math.random() > 0.01) {
      //   SendTransactionToSentryWithTimingData(blah)
      // }
    }
  }
  return onError
}

interface SendToSentryArguments {
  message: string
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug'
  iframeSrc: URL
  createIframeOptions: ErrorReporterArguments['createIframeOptions']
}

function sendToSentry({ message, level = 'error', iframeSrc, createIframeOptions }: SendToSentryArguments): void {
  const errorData = JSON.stringify({
    timestamp: Math.floor(Date.now() / 1000), // Unix time is in seconds, JS time is in milliseconds.
    level,
    platform: 'javascript',
    release: version,
    environment:
      iframeSrc?.host === 'embed.getsetup.io' || iframeSrc?.host === 'lobby-embed.getsetup.io'
        ? 'production'
        : 'development',
    message: {
      formatted: message,
    },
    tags: {
      embeddingOrgId: createIframeOptions.embeddingOrgId,
      targetPage: createIframeOptions.targetPage,
    },
    request: {
      method: 'GET',
      url: window.location.href,
    },
    contexts: {
      browser: {
        name: navigator.userAgent,
      },
      state: {
        state: {
          type: 'gsu-embedded-state',
          value: {
            createIframeOptions,
            timeSincePageLoadInMs: performance?.now ? performance.now() : undefined,
          },
        },
      },
    },
  })

  // Call sentry
  const sentryHost = 'https://o458054.ingest.sentry.io'
  const sentryPublicKey = '843a7e87622d4650a247cac3bb034190'
  const sentryClient = 'gsu-embedded'
  if (navigator?.sendBeacon) {
    navigator.sendBeacon(
      `${sentryHost}/api/4504795180892160/store/?sentry_version=7&sentry_key=${sentryPublicKey}&sentry_client=${sentryClient}`,
      errorData,
    )
  } else if (fetch) {
    fetch(
      `${sentryHost}/api/4504795180892160/store/?sentry_version=7&sentry_key=${sentryPublicKey}&sentry_client=${sentryClient}`,
      { method: 'POST', body: errorData },
    )
  }
  // sendBeacon didn't work, fetch didn't work, this browser is probably IE11 from 2013, we are not going to report this error.
}
