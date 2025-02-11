# Mood - Tabulator User Guide

## Table of Contents

* [Description](#description)
* [Getting Started](#getting-started)
* [How To Use](#how-to-use)
* [Column Configuration](#column-configuration)
  * [Adding basic columns](#adding-basic-columns)
* [Formatting Options](#formatting-options)
  * [Date and time formatting](#date-and-time-formatting)
  * [Numeric formatting](#numeric-formatting)
* [Styling Options](#styling-options)
  * [Edit style menu](#edit-style-menu)
  * [Available themes](#available-themes)
* [Column Properties](#column-properties)
* [Advanced Features](#advanced-features)
  * [Row Grouping](#row-grouping)
  * [Navigable](#navigable)
  * [Global Settings](#global-settings)
    * [Editable](#editable)
    * [Resizable](#resizable)
    * [Column Sorting](#column-sorting)
    * [Header Filters](#header-filters)
* [Current Limitations](#current-limitations)

## Description

Tabulator DataGrid is an accessible component that allows you to display and interact with Tabulator data in your web application. It provides a wide range of features and configuration options to customise the behaviour and appearance of the grid.

[Table of Contents](#table-of-contents)

## Getting Started

1. Obtain the compiled Tabulator file, `Tabulator.zip`.
2. In Mood, navigate to the gallery in the explore tab.
3. Drag and drop the compiled file into the gallery.
4. Locate the Tabulator component.
5. Drag the component into your element.

[Table of Contents](#table-of-contents)

## How To Use

1. Select the Tabulator component in your element.
2. Access the settings panel.
3. Navigate to `Configure information shown`
4. Select your data query:
    - Click `row` to choose your desired query.
    - This will determine the dataset displayed in your grid.

[Table of Contents](#table-of-contents)

## Column Configuration
### Adding basic columns
1. Hovering over the `Columns` tab, click the `+` icon.
2. Provide a column name.
3. Define the content source by selecting the value from the repository.

### Examples
#### Football team names
1. Column Name: "Team Name"
2. Select `Content`.
3. Click `Select a value` on the right panel.
4. Locate and select the team name field from your data source.

[Table of Contents](#table-of-contents)

## Column Groups

To create column groups to organise related data:
1. Hovering over the `Groups` tab, click the `+` icon.
2. Give your group a name and add columns.
3. Add `SubGroups` for another level of nesting.
4. Click the collapse/expand arrows in the group's heading when previewing your web application to manage group visibility.

> Group visibility arrows will only show up in the group's heading if the group holds multiple columns or sub groups.

[Table of Contents](#table-of-contents)

## Formatting Options

### Date and time formatting

`timedata`: Displays both date and time.\
`date`: Shows date only.\
`time`: Shows time only.

Supports custom date formatting using patterns:
- `%ms`: Milliseconds
- `%ss`: Seconds
- `%mm`: Minutes
- `%HH`: Two-digit hour
- `%hh`: Two-digit hour
- `%H`: Single-digit hour
- `%h`: Single-digit hour
- `%dddd`: Full name of day (Monday)
- `%ddd`: Short name of day (Mon)
- `%dd`: Two-digit day
- `%MMMM`: Full name of month (August)
- `%MMM`: Short name of month (Aug)
- `%MM`: Two-digit month
- `%yyyy`: Four-digit year
- `%yy`: Two-digit year
- `%tt`: Terrestrial time
- Example: `%yyyy-%MM-%dd` for `2025-01-27`

> These formatting options converts an ISO Date String to a desired format.

### Numeric formatting

`stars`: Converts numbers 0-5 to star ratings.

##### Example image
![Formatting example image](./Images/formatExample.PNG)

[Table of Contents](#table-of-contents)

## Styling Options

### Edit style menu

1. Navigating to `Edit Style` in the settings panel will pop up with a JSON configuration interface.
2. To add an initial row ID column, set `enabled` to `true` inside the `initialRow` object.
    - Setting this to false will disable the initial row ID column.
    - This initial column will be disabled by default.
3. To change the table's theme, input an available theme under `stylingOptions`.
4. For all text to automatically wrap, set `wrapText` to `true`.

### Available themes

`"Modern"`: Contemporary design.\
`"Midnight"`: Dark mode interface.\
`"Simple"`: Minimalist appearance.\
Default: Grey theme

> Default is applied when the theme is blank or invalid.

#### Edit Style interface
![Edit style menu interface image](./Images/jsonInterface.PNG)

#### Example images
##### Initial Row ID Disabled
![Edit style menu interface image](./Images/initialRowIdDisabled.PNG)

##### Initial Row ID Enabled
![Edit style menu interface image](./Images/initialRowIdEnabled.PNG)

## Column Properties

- `Width`: Leave blank for auto-sizing or type in a number.
- `Header Alignment`: Customise header text alignment.
- `Frozen`: Fix columns in place during horizontal scrolling.
- `Editable`: Allow cells to become editable. Global setting `Editable` needs to be enabled.
- `Header Filter`: Show filters within the column header. Global setting `Header Filtering` needs to be enabled.
- `Column Sorter`: Enable column sorting. Global setting `Column Sorting` needs to be enabled.
- `Resizable`: Allow the column to be resizable by dragging the column edges. Global setting `Resizable` needs to be enabled.

[Table of Contents](#table-of-contents)

## Advanced Features

### Row Grouping
1. For grouped rows, enable row grouping feature.
2. Specify grouping criteria:
    - Pick lists recommended for multiple-grouping levels.

### Navigable
1. For the option to navigate to element when right clicking on a cell, enable navigable.
2. Navigate to `Add Interactions` in the settings panel.
3. Under `On User Interaction`, click `Cell Click`.
4. Click `Add Action`.
5. Add the `Navigate` action.
6. Provide a name for the action.

> Following these steps will provide you with the option to navigate to a cell's element if you right-click on a cell. 

### Global Settings

> Global settings enable features that can be used for each column in the DataGrid. Below are a list of available global settings:

#### Editable
1. Enable in-line editing for each data cell.
2. Override this feature for specific columns by changing the `Editable` field when configuring your columns.

#### Resizable
1. Enable columns to be resized by dragging the edges.
2. Override this feature for specific columns by changing the `Resizable` field when configuring your columns.

#### Column Sorting
1. Enable column sorting for the ability to sort columns in ascending or descending order.
2. Override this feature for specific columns by changing the `Column Sorter` field when configuring your columns.

#### Header Filters
1. Enable header filters for each column.
2. Override this feature for specific columns by changing the `Header Filter` field when configuring your columns.

> If a global setting is enabled, you can override this setting when configuring each column. 

> For example, if you would like to add header filtering, global setting `Header Filters` must be enabled. If you would like specific columns to not have header filters, disable `Header Filtering` when configuring these columns.

[Table of Contents](#table-of-contents)

## Current Limitations

1. Drop-down menus are currently not available for selecting formatting options. You will have to manually type these options into a text field.

[Table of Contents](#table-of-contents)