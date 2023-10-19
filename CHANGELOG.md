# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2023-11-13

### Removed

- Removed the min-height set on the iframe element.

### Added

- Allow the userId and user segment to be passed via analyticsInfo.

## [1.7.0] - 2023-10-02

### Added

- Experimental support for a different back end powering the embed experience.

## [1.6.0] - 2023-08-21

### Added

- `linkTemplates.learnPage`: An option to pass in a URL template that will be used to construct links from one browse page to the learn page.

- `linkTemplates.fitnessPage`: An option to pass in a URL template that will be used to construct links from one browse page to fitness page.

- New sandbox attribute `allow-popups`: Allows popups (like from Window.open(), target="_blank", Window.showModalDialog()). This has been added to enable the 'add to calendar' functionality, which allows a user to open a new web page to book an upcoming class using their preferred calendar service.

## [1.5.0] - 2023-07-26

### Added

- The `disableHelp` option.
- The first of the `themeOptions`, the `logoUrl`.
- The `analyticsInfo` option. This is information used to report analytics back to your organisation.

### Deprecated

- The `deviceId` option. This is being replaced by `analyticsInfo.deviceId`.

## [1.4.1] - 2023-06-27

### Changed

- Minor documentation updates.

## [1.4.0] - 2023-06-16

### Changed

- The `joinClass` page no longer has special css set on the iframe. All iframe created by this package now have the same css properties set:

```css
width: 100%;
border: none;
height: 100%;
min-height: 300px;
```

This means that the size of the joinClass iframe can be controlled by the element that surrounds the iframe. See the [Readme](./README.md#page-layout) for details.

## [1.3.0] - 2023-06-12

### Added

- `disableChat`: An option to pass disable the chat tab on the join class page. If chat is disabled then the `tokenRequestCallBack` is not needed.

### Changed

- `tokenRequestCallBack`: The `tokenRequestCallBack` is now optional. If chat is disabled then this will do nothing. If chat is enabled then this is required to authenticate users.

## [1.2.0] - 2023-05-03

### Added

- `linkTemplates.joinClass`: An option to pass in a URL template that will be used to construct links from the browse pages to the join class page.

## [1.1.2] - 2023-04-17

### Fixed

- The join class page will no longer have it's height set to a fixed value.
  - The content on the join class page acts differently to the content on the other pages. The join class page adapts to the size of the window, where as the browse pages need to be a fixed height to trigger a scroll bar on the hosting page.
- Error reporting will now report the correct environment for the join class page.
- Error reporting will now report the correct package version.

### Added

- Error reporting will now report the page url where the error occurred.

## [1.1.1] - 2023-03-08

### Added

- We will now report errors loading the iframe back to GetSetUp via Sentry.io.
  - We send a small set of data, mostly the options passed into the createIframe function.
  - We do not send any Personal Identifiable Information (PII).
- There is no change to the public interface of this package at this stage, but we are considering improvements to iframe lifecycle and error notification.
  - To that end we have added support for a `gsuIframeLoaded` post message to replace the use of the `gsuDocumentHeight` message to know when the iframe has loaded. The `gsuIframeLoaded` is not currently used, but will start being emitted by GetSetUp iframes in the near future.

## [1.1.0] - 2023-03-03

### Added

- The createIframe function now returns an object with a `cleanUp()` function that can be used to clean up timers and event listeners before recreating the iframe.

## [1.0.2] - 2023-03-01

### Added

- The iframe loading error message now distinguishes between the HEAD request failing and a page load timeout.

### Fixed

- The createIframe function now supports a fallback for browsers that don't support replaceChildren. See: <https://caniuse.com/?search=replaceChildren>.

## [1.0.1] - 2023-02-28

### Fixed

- Changed the url the joinClass page points to so we can enable caching on that endpoint.

## [1.0.0] - 2023-02-23

- Initial release.
