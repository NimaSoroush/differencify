## [1.5.3] - 2018-11-11
### Added
- `mockRequests` method to wrap Mockeer functionality

## [1.5.2] - 2018-11-11
### Updated
- Added example of using `.click(selector)` to `API.md`

## [1.5.1] - 2018-10-07
### Fixed
- Fix issue with cleanig up leftover images from previous runs

## [1.5.0] - 2018-08-30
### Added
- Making Differencify compatible with differencify-jest-reporter
- Save the captured image from current test run to test report path by default

## [1.4.3] - 2018-07-21
### Updated
- Integrating greenkeeper
- Updating several packages

## [1.4.2] - 2018-07-13
### Fixed
- Fixing issue with freezeImage command

## [1.4.1] - 2018-06-22
### Added
- A prepare script to keep the artifact uptodated

## [1.4.0] - 2018-06-21
### Changed
- `toMatchScreenshot` updated to accept a callback parameter which is passed
  details of the comparison (See [API.md](/NimaSoroush/differencify/blob/master/API.md#detailed-result-information)
  for details.)

### Added
- NPM script `test:integration` to streamline running integration tests in Docker

## [1.3.4] - 2018-06-09
### Fixed
- Export module Differencify
- Make Differencify running with vanilla node
- Fix screenshot path issue for non jest

## [1.3.3] - 2018-06-06
### Fixed
- Bug fixed for custom test path

## [1.3.1] - 2018-05-25
### Fixed
- Bug fixed for testName not being picked up correctly

## [1.3.0] - 2017-12-15
### Fixed
- Support all puppeteer API calls
- Support multiple toMatchSnapshots
- Improved logging
- Improved documentation and examples
- Added integration tests
- Bug fixes

## [1.2.0] - 2017-11-23
### Added
- Add page click functionality

## [1.1.5] - 2017-11-08
### Fixed
- Update to puppeteer@0.12.0
- Fixing issue with passing browserArgs to chrome headless
- Enhanced debugging for parameter sanitization

## [1.1.4] - 2017-11-03
### Fixed
- Fixed issue with jest failure if error happens in steps

## [1.1.3] - 2017-10-30
### Fixed
- Fixed issue with calling cleanup
- Improved readme file

## [1.1.2] - 2017-10-26
### Changed
- Made explicit that library targets node 8.6+
- Set babel target to node 8.6

## [1.1.1] - 2017-10-23
### Changed
- Bug fix

## [1.1.0] - 2017-10-19
### Changed
- Add jest snapshot support
- Performance improvement
- Better logging

## [1.0.0] - 2017-10-10
### Changed
- Replacing chromy with puppeteer as backend
- Add functionality to chain differencify methods
- Add resize functionality
- Removed dependency to config files
- Better logging
- Bug fixes

## [0.0.18] - 2017-08-14
### Added
- Fixing issue with freezing image
- Upgrading Chromy to version 0.4.7

## [0.0.17] - 2017-08-07
### Added
- Upgrading Chromy to version 0.4.5

## [0.0.16] - 2017-08-04
### Added
- Bug fixes

## [0.0.15] - 2017-08-03
### Added
- Adding evaluate functionality to evaluate expression on browser
- Adding freeze image functionality to freeze animations

## [0.0.14] - 2017-08-01
### Added
- Assign free ports to run chrome instances

## [0.0.13] - 2017-07-25
### Added
- Updating readme file
- Bug fixes

## [0.0.12] - 2017-07-24
### Added
- Added wait functionality
- Create prefix logger for tests (timestamped)
- Refactor compare image to async function with better error handling
- Some cleanups

## [0.0.11] - 2017-07-21
### Added
- Added cleanup functionality
- Added circleci to project

## [0.0.10] - 2017-07-07
### Added
- Added chromy.screenshot()

## [0.0.9] - 2017-07-07
### Changed
- Fixed bug

## [0.0.8] - 2017-07-07
### Changed
- Fixed bug

## [0.0.7] - 2017-07-07
### Changed
- Enabling option to save differencified image to disk
- Fixed bugs
- Decrease mismatchThreshold
- set default visible to false

## [0.0.6] - 2017-07-06
### Changed
- fixed logging issue

## [0.0.5] - 2017-07-06
### Changed
- Decreased default threshold to 0.01
- Updated logging to log difference error
- Update Readme.md
- Added a Dockerfile for local/CI usage

## [0.0.4] - 2017-07-06
### Changed
- Upgrading chromy to 0.3.2
- Removing shrinkwrap file to project

## [0.0.3] - 2017-07-05
### Changed
- Save differencified screenshots in case mismatch found
- Adding shrinkwrap file to project
- Add option to specify testReportPath

## [0.0.2] - 2017-07-04
### Changed
- Fixed screenshot capturing
- Add test functionality
- Examples added

## [0.0.1] - 2017-07-02
### Changed
- Initial release
