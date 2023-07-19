import { fireEvent, queryByAttribute } from '@testing-library/dom'
import '@testing-library/jest-dom'
import * as GSU from './index'

// We need to import this in this funky way so we can reset the module between tests.
// The module has private state that is fine if you use it once on a page, but breaks the tests.
let createIframe: typeof GSU.createIframe

jest.useFakeTimers()

jest.isolateModules(() => {
  createIframe = require('./index').createIframe
})

const mockNavCallback = (): void => {}
const mockTokenCallback = (): Promise<string> => Promise.resolve('a-valid-token')
global.navigator.sendBeacon = jest.fn()

describe('GSU Embedded Shell', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    jest.resetModules()
    createIframe = require('./index').createIframe
    jest.clearAllMocks()
    global.navigator.sendBeacon = jest.fn()
  })

  test("throws an error if the targetId isn't in the page", () => {
    document.body.innerHTML = '<div id="notTheGsuTarget"></div>'

    const testWrapper = (): GSU.IframeInstance =>
      createIframe({
        targetElementId: 'shouldBeThisTarget',
        targetPage: 'learn',
        navigationCallBack: mockNavCallback,
        embeddingOrgId: 'AOL',
        tokenRequestCallBack: mockTokenCallback,
      })

    expect(testWrapper).toThrow(
      'GSU Embedded Shell cannot find the targetElement shouldBeThisTarget to mount the iframe.',
    )
  })

  test('throws an error if the lobby page is requested without a session id', () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    const testWrapper = (): GSU.IframeInstance =>
      createIframe({
        targetElementId: 'gsuTarget',
        targetPage: 'joinClass',
        navigationCallBack: mockNavCallback,
        embeddingOrgId: 'AOL',
        tokenRequestCallBack: mockTokenCallback,
      })

    expect(testWrapper).toThrow('sessionId is required if you are loading a join class page.')
  })

  test('resizes iframe on learn/fitness page when it gets the correct message', async () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'learn',
      navigationCallBack: mockNavCallback,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: mockTokenCallback,
      sessionId: '834bhf98shb8',
      targetUrls: {
        learn: 'https://embed.getsetup.io/embedded/testing/learn',
        fitness: 'https://embed.getsetup.io/embedded/testing/fitness',
        joinClass: 'https://lobby.getsetup.io/embedded/testing/lobby',
      },
    })
    const gsuTargetChildren = queryByAttribute('id', document.body, 'gsuTarget')?.children
    const gsuIframe = gsuTargetChildren![0]

    // Use fire event to simulate window.postMessage()
    fireEvent(
      window,
      new MessageEvent('message', { data: { gsuDocumentHeight: 300 }, origin: 'https://embed.getsetup.io' }),
    )
    expect(gsuIframe).toHaveStyle({ height: '300px' })

    fireEvent(
      window,
      new MessageEvent('message', { data: { gsuDocumentHeight: 400 }, origin: 'https://embed.getsetup.io' }),
    )
    expect(gsuIframe).toHaveStyle({ height: '400px' })
  })

  test('does not resize the iframe when it gets messages on the joinClass page', async () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'joinClass',
      navigationCallBack: mockNavCallback,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: mockTokenCallback,
      sessionId: '834bhf98shb8',
      targetUrls: {
        learn: 'https://embed.getsetup.io/embedded/testing/learn',
        fitness: 'https://embed.getsetup.io/embedded/testing/fitness',
        joinClass: 'https://lobby.getsetup.io/embedded/testing/lobby',
      },
    })
    const gsuTargetChildren = queryByAttribute('id', document.body, 'gsuTarget')?.children
    const gsuIframe = gsuTargetChildren![0]

    // Use fire event to simulate window.postMessage()
    fireEvent(
      window,
      new MessageEvent('message', { data: { gsuDocumentHeight: 300 }, origin: 'https://embed.getsetup.io' }),
    )
    expect(gsuIframe).toHaveStyle({ height: '100%' })

    fireEvent(
      window,
      new MessageEvent('message', { data: { gsuDocumentHeight: 400 }, origin: 'https://embed.getsetup.io' }),
    )
    expect(gsuIframe).toHaveStyle({ height: '100%' })
  })

  test('processes messages from a caller defined url', async () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'learn',
      navigationCallBack: mockNavCallback,
      embeddingOrgId: 'AOL',
      sessionId: 'a-valid-session-id',
      tokenRequestCallBack: mockTokenCallback,
      targetUrls: {
        learn: 'https://somesite.gsudevelopment.com',
        fitness: 'https://embed.getsetup.io/embedded/testing/fitness',
        joinClass: 'https://lobby.getsetup.io/embedded/testing/lobby',
      },
    })
    const gsuTargetChildren = queryByAttribute('id', document.body, 'gsuTarget')?.children
    const gsuIframe = gsuTargetChildren![0]

    // Use fire event to simulate window.postMessage()
    fireEvent(
      window,
      new MessageEvent('message', { data: { gsuDocumentHeight: 300 }, origin: 'https://somesite.gsudevelopment.com' }),
    )
    expect(gsuIframe).toHaveStyle({ height: '300px' })
  })

  test('rejects messages from an origin that is not in the allowed list', async () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'joinClass',
      navigationCallBack: mockNavCallback,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: mockTokenCallback,
      sessionId: '834bhf98shb8',
    })
    const gsuTargetChildren = queryByAttribute('id', document.body, 'gsuTarget')?.children
    const gsuIframe = gsuTargetChildren![0]

    // Use fire event to simulate window.postMessage()
    fireEvent(
      window,
      new MessageEvent('message', { data: { gsuDocumentHeight: 300 }, origin: 'https://embed.attacker.com' }),
    )
    expect(gsuIframe).not.toHaveStyle({ height: '300px' })
  })

  test('constructs the default fitness page url correctly', () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'fitness',
      navigationCallBack: mockNavCallback,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: mockTokenCallback,
    })

    const gsuTargetChildren = queryByAttribute('id', document.body, 'gsuTarget')?.children
    expect(gsuTargetChildren).not.toBeNull()
    expect(gsuTargetChildren).not.toBeUndefined()
    expect(gsuTargetChildren!.length).toBe(1)

    const gsuIframe = gsuTargetChildren![0]
    // We expect the embeddingOrgId to be lowercased.
    expect(gsuIframe).toHaveAttribute('src', expect.stringContaining('https://embed.getsetup.io/embedded/aol/fitness'))
  })

  test('constructs the default lobby page url correctly', () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'joinClass',
      navigationCallBack: mockNavCallback,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: mockTokenCallback,
      sessionId: 'a-valid-session-id',
    })

    const gsuTargetChildren = queryByAttribute('id', document.body, 'gsuTarget')?.children
    expect(gsuTargetChildren).not.toBeNull()
    expect(gsuTargetChildren).not.toBeUndefined()
    expect(gsuTargetChildren!.length).toBe(1)

    const gsuIframe = gsuTargetChildren![0]
    // We expect the embeddingOrgId to be lowercased.
    expect(gsuIframe).toHaveAttribute(
      'src',
      expect.stringContaining('https://lobby-embed.getsetup.io/session/a-valid-session-id?embedding-org-id=aol'),
    )
  })

  test('constructs the default learn page url correctly', () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'learn',
      navigationCallBack: mockNavCallback,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: mockTokenCallback,
    })

    const gsuTargetChildren = queryByAttribute('id', document.body, 'gsuTarget')?.children
    expect(gsuTargetChildren).not.toBeNull()
    expect(gsuTargetChildren).not.toBeUndefined()
    expect(gsuTargetChildren!.length).toBe(1)

    const gsuIframe = gsuTargetChildren![0]
    // We expect the embeddingOrgId to be lowercased.
    expect(gsuIframe).toHaveAttribute('src', expect.stringContaining('https://embed.getsetup.io/embedded/aol/learn'))
  })

  test('respects learn page url that is passed in by the caller', () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'learn',
      navigationCallBack: mockNavCallback,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: mockTokenCallback,
      sessionId: '834bhf98shb8',
      targetUrls: {
        learn: 'http://localhost:9999/testing-learn',
        fitness: 'http://localhost:9999/testing-fitness',
        joinClass: 'http://localhost:9999/testing-lobby',
      },
    })

    const gsuTargetChildren = queryByAttribute('id', document.body, 'gsuTarget')?.children
    expect(gsuTargetChildren).not.toBeNull()
    expect(gsuTargetChildren).not.toBeUndefined()
    expect(gsuTargetChildren!.length).toBe(1)

    const gsuIframe = gsuTargetChildren![0]
    expect(gsuIframe).toHaveAttribute('src', expect.stringContaining('http://localhost:9999/testing-learn'))
  })

  test('respects fitness page url that is passed in by the caller', () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'fitness',
      navigationCallBack: mockNavCallback,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: mockTokenCallback,
      targetUrls: {
        learn: 'http://localhost:9999/testing-learn',
        fitness: 'http://localhost:9999/testing-fitness',
        joinClass: 'http://localhost:9999/testing-lobby',
      },
    })

    const gsuTargetChildren = queryByAttribute('id', document.body, 'gsuTarget')?.children
    expect(gsuTargetChildren).not.toBeNull()
    expect(gsuTargetChildren).not.toBeUndefined()
    expect(gsuTargetChildren!.length).toBe(1)

    const gsuIframe = gsuTargetChildren![0]
    expect(gsuIframe).toHaveAttribute('src', expect.stringContaining('http://localhost:9999/testing-fitness'))
  })

  test('respects lobby page url that is passed in by the caller', () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'joinClass',
      navigationCallBack: mockNavCallback,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: mockTokenCallback,
      sessionId: '834bhf98shb8',
      targetUrls: {
        learn: 'http://localhost:9999/testing-learn',
        fitness: 'http://localhost:9999/testing-fitness',
        joinClass: 'http://localhost:9999/testing-lobby',
      },
    })

    const gsuTargetChildren = queryByAttribute('id', document.body, 'gsuTarget')?.children
    expect(gsuTargetChildren).not.toBeNull()
    expect(gsuTargetChildren).not.toBeUndefined()
    expect(gsuTargetChildren!.length).toBe(1)

    const gsuIframe = gsuTargetChildren![0]
    expect(gsuIframe).toHaveAttribute('src', expect.stringContaining('http://localhost:9999/testing-lobby'))
  })

  test('calls the navigation call back when sent the right message', () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    const navFunction = jest.fn()

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'fitness',
      navigationCallBack: navFunction,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: mockTokenCallback,
    })

    // Use fire event to simulate window.postMessage()
    fireEvent(
      window,
      new MessageEvent('message', {
        data: { gsuNavigation: { targetPage: 'learn' } },
        origin: 'https://embed.getsetup.io',
      }),
    )
    expect(navFunction).toBeCalledWith('learn', undefined, undefined)
  })

  test('calls the navigation call back with sessionId and classSlug when sent a message to navigate to the joinClass page', () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    const navFunction = jest.fn()

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'fitness',
      navigationCallBack: navFunction,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: mockTokenCallback,
    })

    // Use fire event to simulate window.postMessage()
    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          gsuNavigation: { targetPage: 'joinClass', sessionId: 'a-valid-session-id', classSlug: '-some-class-slug-' },
        },
        origin: 'https://embed.getsetup.io',
      }),
    )
    expect(navFunction).toBeCalledWith('joinClass', 'a-valid-session-id', '-some-class-slug-')
  })

  test('does not call the navigation call back when sent a message with an invalid targetPage', () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    const navFunction = jest.fn()

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'fitness',
      navigationCallBack: navFunction,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: mockTokenCallback,
    })

    // Use fire event to simulate window.postMessage()
    fireEvent(
      window,
      new MessageEvent('message', {
        data: { gsuNavigation: { targetPage: 'notAPageWeSupport' } },
        origin: 'https://embed.getsetup.io',
      }),
    )
    expect(navFunction).not.toBeCalled()
  })

  test('calls the token request call back when sent the right message', () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    // const tokenRequestFunction = jest.fn()
    const tokenRequestFunction = jest.fn().mockImplementation(() => Promise.resolve())

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'fitness',
      navigationCallBack: mockNavCallback,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: tokenRequestFunction,
    })

    // Use fire event to simulate window.postMessage()
    fireEvent(
      window,
      new MessageEvent('message', {
        data: { gsuTokenRequest: true },
        origin: 'https://embed.getsetup.io',
      }),
    )
    expect(tokenRequestFunction).toBeCalledTimes(1)
  })

  test('sends the token back to the iframe when it gets a token in a promise', (done) => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    const tokenRequestFunction = (): Promise<string> => {
      return Promise.resolve('some-token-string')
    }

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'fitness',
      navigationCallBack: mockNavCallback,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: tokenRequestFunction,
    })

    const gsuEmbeddedIframe = document.querySelector('#gsuTarget iframe') as HTMLIFrameElement
    gsuEmbeddedIframe.contentWindow?.addEventListener('message', (event) => {
      console.log(event.data.gsuTokenFromHost)
      if (event.data.gsuTokenFromHost) {
        // We have to catch the error and call done with it or we will get
        // either as timeout error or a hard to follow Object.is equality error
        // rather than a nice expect() failure message.
        try {
          expect(event.data.gsuTokenFromHost).toBe('some-token-string')
          done()
        } catch (error) {
          done(error)
        }
      }
    })

    // Use fire event to simulate window.postMessage()
    fireEvent(
      window,
      new MessageEvent('message', {
        data: { gsuTokenRequest: true },
        origin: 'https://embed.getsetup.io',
      }),
    )
  })

  test('sends the token back to the iframe when it gets a token as a pain string', (done) => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    const tokenRequestFunction = (): string => {
      return 'some-token-string'
    }

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'fitness',
      navigationCallBack: mockNavCallback,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: tokenRequestFunction,
    })

    const gsuEmbeddedIframe = document.querySelector('#gsuTarget iframe') as HTMLIFrameElement
    gsuEmbeddedIframe.contentWindow?.addEventListener('message', (event) => {
      console.log(event.data.gsuTokenFromHost)
      if (event.data.gsuTokenFromHost) {
        // We have to catch the error and call done with it or we will get
        // either as timeout error or a hard to follow Object.is equality error
        // rather than a nice expect() failure message.
        try {
          expect(event.data.gsuTokenFromHost).toBe('some-token-string')
          done()
        } catch (error) {
          done(error)
        }
      }
    })

    // Use fire event to simulate window.postMessage()
    fireEvent(
      window,
      new MessageEvent('message', {
        data: { gsuTokenRequest: true },
        origin: 'https://embed.getsetup.io',
      }),
    )
  })

  test('calls the status callback when loading the iframe', async () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    const statusCallBack = jest.fn()

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'joinClass',
      navigationCallBack: mockNavCallback,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: mockTokenCallback,
      statusCallBack: statusCallBack,
      sessionId: '834bhf98shb8',
    })

    expect(statusCallBack).toBeCalledWith({ status: 'LOADING', message: 'The GetSetUp iframe is currently loading.' })
  })

  test('calls the status callback with a success when loading the iframe works (gsuDocumentHeight)', async () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'
    const statusCallBack = jest.fn()

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'joinClass',
      navigationCallBack: mockNavCallback,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: mockTokenCallback,
      statusCallBack: statusCallBack,
      sessionId: '834bhf98shb8',
    })

    // Fake the message that will be sent from the iframe when it loads successfully.
    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          gsuDocumentHeight: 1,
        },
        origin: 'https://embed.getsetup.io',
      }),
    )

    expect(statusCallBack).toBeCalledTimes(2)

    expect(statusCallBack).toHaveBeenNthCalledWith(1, {
      status: 'LOADING',
      message: 'The GetSetUp iframe is currently loading.',
    })
    expect(statusCallBack).toHaveBeenNthCalledWith(2, {
      status: 'SUCCESS',
      message: 'The GetSetUp iframe loaded successfully.',
    })
  })

  test('calls the status callback with a success when loading the iframe works (gsuIframeLoaded)', async () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'
    const statusCallBack = jest.fn()

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'joinClass',
      navigationCallBack: mockNavCallback,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: mockTokenCallback,
      statusCallBack: statusCallBack,
      sessionId: '834bhf98shb8',
    })

    // Fake the message that will be sent from the iframe when it loads successfully.
    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          gsuIframeLoaded: true,
        },
        origin: 'https://embed.getsetup.io',
      }),
    )

    expect(statusCallBack).toBeCalledTimes(2)

    expect(statusCallBack).toHaveBeenNthCalledWith(1, {
      status: 'LOADING',
      message: 'The GetSetUp iframe is currently loading.',
    })
    expect(statusCallBack).toHaveBeenNthCalledWith(2, {
      status: 'SUCCESS',
      message: 'The GetSetUp iframe loaded successfully.',
    })
  })

  test('calls the status callback with an error when loading the iframe fails', async () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'
    const statusCallBack = jest.fn()

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'joinClass',
      navigationCallBack: mockNavCallback,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: mockTokenCallback,
      statusCallBack: statusCallBack,
      sessionId: '834bhf98shb8',
    })

    expect(statusCallBack).toBeCalledTimes(1)

    expect(statusCallBack).toHaveBeenNthCalledWith(1, {
      status: 'LOADING',
      message: 'The GetSetUp iframe is currently loading.',
    })

    // Fast forward time until the iframe loading timeout fires.
    jest.runAllTimers()

    expect(statusCallBack).toBeCalledTimes(2)

    expect(statusCallBack).toHaveBeenNthCalledWith(2, {
      status: 'ERROR',
      message: 'The GetSetUp iframe timed out.',
    })
  })

  test('calls sentry via the sendBeacon API when it is available when loading the iframe fails', async () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'joinClass',
      navigationCallBack: mockNavCallback,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: mockTokenCallback,
      sessionId: '834bhf98shb8',
    })

    expect(global.navigator.sendBeacon).toBeCalledTimes(0)

    // Fast forward time until the iframe loading timeout fires.
    jest.runAllTimers()

    expect(global.navigator.sendBeacon).toBeCalledTimes(1)
  })

  test('calls sentry via the fetch API when sendBeacon is not available when loading the iframe fails', async () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    global.navigator.sendBeacon = undefined as unknown as Navigator['sendBeacon']
    //global.fetch = jest.fn()

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'joinClass',
      navigationCallBack: mockNavCallback,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: mockTokenCallback,
      sessionId: '834bhf98shb8',
    })

    // expect(global.navigator.sendBeacon).toBeCalledTimes(0)

    // Fast forward time until the iframe loading timeout fires.
    jest.runAllTimers()

    // Once for the head request, once for the loading failed report.
    expect(global.fetch).toBeCalledTimes(2)
  })

  test('sends the disableChat query string if required', () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'fitness',
      navigationCallBack: mockNavCallback,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: mockTokenCallback,
      disableChat: true,
    })

    const gsuTargetChildren = queryByAttribute('id', document.body, 'gsuTarget')?.children
    expect(gsuTargetChildren).not.toBeNull()
    expect(gsuTargetChildren).not.toBeUndefined()
    expect(gsuTargetChildren!.length).toBe(1)

    const gsuIframe = gsuTargetChildren![0]
    expect(gsuIframe).toHaveAttribute('src', expect.stringContaining('disable-chat=true'))
  })

  test('sends the disableHelp query string if required', () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'fitness',
      navigationCallBack: mockNavCallback,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: mockTokenCallback,
      disableHelp: true,
    })

    const gsuTargetChildren = queryByAttribute('id', document.body, 'gsuTarget')?.children
    expect(gsuTargetChildren).not.toBeNull()
    expect(gsuTargetChildren).not.toBeUndefined()
    expect(gsuTargetChildren!.length).toBe(1)

    const gsuIframe = gsuTargetChildren![0]
    expect(gsuIframe).toHaveAttribute('src', expect.stringContaining('disable-help=true'))
  })

  test('sends the themeOptions query string if required', () => {
    document.body.innerHTML = '<div id="gsuTarget"></div>'

    createIframe({
      targetElementId: 'gsuTarget',
      targetPage: 'fitness',
      navigationCallBack: mockNavCallback,
      embeddingOrgId: 'AOL',
      tokenRequestCallBack: mockTokenCallback,
      themeOptions: {
        logoUrl: 'https://example.com/logo.svg',
      },
    })

    const gsuTargetChildren = queryByAttribute('id', document.body, 'gsuTarget')?.children
    expect(gsuTargetChildren).not.toBeNull()
    expect(gsuTargetChildren).not.toBeUndefined()
    expect(gsuTargetChildren!.length).toBe(1)

    const gsuIframe = gsuTargetChildren![0]

    const themeOptionsEncoded = encodeURIComponent(
      btoa(
        JSON.stringify({
          logoUrl: 'https://example.com/logo.svg',
        }),
      ),
    )

    expect(gsuIframe).toHaveAttribute('src', expect.stringContaining(`theme-options=${themeOptionsEncoded}`))
  })
})
