## js8path-vue

# js8path-pskreporter Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

### ToDo
 - priority
   - path ratings
   - current path
     - path header with title and action icons
     - path message construction
     - save/recall paths
   - loading/computing/plotting indicator(s)
   - mapping right-side view
   - improve load/recompute time
   - tooltips everywhere - maybe internationalization?
   - azimuthal improvements: keep same projection name?
   - hamburger menu, about message, inject versioning
 - settings
   - favorite searches
     - edit/save in settings
     - remove term from search widget
   - max report age
   - max path length
   - import/export settings files
   - reset to default
 - path builder
   - show loops terminating in root station
 - paths list
    - path cards
      - compressed version
      - vertical version
  - saved path lists
    - save multiple paths
    - each path editable (load to path builder)
    - delete one or all
 - vuex state for current screen, current selections
 - pop-up details for individual reports
 - csv data
   - csv display for all stations currently hidden
   - button to display in new window or popup or download
   - enable for other data tables
 - computed paths to/from
   - Detailed Path object (from simple path) with computed values
     - end to end bearing/distance/rating
     - more values
   - computed paths table
     - standard search component
     - filters for incoming/outgoing/all/twoway 
     - selectors for max path length (recompute)
     - expand rows to show indiv paths table
   - map computed paths as selected 
   - one way or two way
   - end-to-end or leave 3rd pty msg
 - mapping
   - set age limit on contacts
   - rx-only and/or tx-only stations: show/hide/remove
   - fix grayline inversion on azimuthal projection
   - offset station points with same locator
   - try side-by-side layout with tables and maps, window view
   - center on station also zooms to station reports extent
   - other projection selections
   - per-link azimuthal (trip-tik)
   - setting for specified/fixed grayline

## [1.0.1] - unreleased

### Changed
- allow console.log statements in build for now
- use full pskreporter API URL in production build
  - prefix url with cors-anywhere URL
  - build works from local filesystem and github pages

## [1.0.0] - 2020-12-07

### Changed
- migrated from @corrt/js8path-vue private repository
- initial release 1.0.0
   
## [0.1.1] - unreleased

### Changed
- add transforms for js8path-data

## [0.1.0] - 2019-06-02

### Added
- initial implementation 

## [Template] - YYYY-MM-DD

### ToDo
- ...

### Added
- ...

### Changed
- ...

### Fixed
- ...

### Removed
- ...

