# Requirements Document

## Introduction

This document specifies the requirements for a Notes Listing Page feature in the Habitrack application. The feature provides users with a dedicated page to view all their notes in a single, scrollable list. Notes can be associated with time periods (day, week, month) or with specific habit occurrences. The page displays notes sorted by creation date (newest first) with infinite scroll pagination, allowing users to browse their complete note history without leaving the page.

## Glossary

- **Note**: A user-created text entry that can be associated with either a time period or a habit occurrence
- **Period Note**: A note associated with a specific time period (day, week, or month), identified by `period_kind` and `period_date`
- **Occurrence Note**: A note associated with a specific habit occurrence, identified by `occurrence_id`
- **Period Kind**: The type of time period a note is associated with: "day", "week", or "month"
- **ScrollShadow**: A HeroUI component that displays shadow indicators at scroll boundaries
- **Infinite Scroll**: A pagination pattern where additional content loads automatically when the user scrolls to the bottom
- **Notes List Container**: The scrollable container that holds all note items and takes up the available viewport height

## Requirements

### Requirement 1

**User Story:** As a user, I want to access a Notes page from the main navigation, so that I can view all my notes in one place.

#### Acceptance Criteria

1. WHEN a user views the application header THEN the Header component SHALL display a "Notes" navigation link alongside the existing "Calendar" and "Habits" links
2. WHEN a user clicks the "Notes" navigation link THEN the Application SHALL navigate to the `/notes` route
3. WHEN the user is on the Notes page THEN the Header component SHALL visually indicate the "Notes" link as active using the solid variant style

### Requirement 2

**User Story:** As a user, I want to see all my notes listed on the Notes page, so that I can browse through my note history.

#### Acceptance Criteria

1. WHEN the Notes page loads THEN the Notes_List_Service SHALL fetch notes for the current user sorted by `created_at` in descending order
2. WHEN notes are fetched THEN the Notes_Page SHALL display each note in a list format within a ScrollShadow container
3. WHEN the Notes page renders THEN the Notes_List_Container SHALL occupy the full available viewport height minus the header height
4. WHEN the Notes page renders THEN the page body SHALL remain non-scrollable while the Notes_List_Container SHALL be scrollable

### Requirement 3

**User Story:** As a user, I want to see relevant information for each note, so that I can understand the context and content of my notes.

#### Acceptance Criteria

1. WHEN displaying a period note THEN the Note_Item component SHALL show the `period_date` formatted according to the `period_kind` as the title
2. WHEN displaying an occurrence note THEN the Note_Item component SHALL show the associated habit name as the title
3. WHEN displaying any note THEN the Note_Item component SHALL show the note `content` as the body text
4. WHEN displaying any note THEN the Note_Item component SHALL show the `updated_at` timestamp in a smaller text format
5. WHEN displaying a period note THEN the Note_Item component SHALL show a distinct icon representing the `period_kind` (day, week, or month)
6. WHEN displaying an occurrence note THEN the Note_Item component SHALL show the associated habit's icon

### Requirement 4

**User Story:** As a user, I want notes to load progressively as I scroll, so that the page loads quickly and I can access older notes by scrolling.

#### Acceptance Criteria

1. WHEN the Notes page initially loads THEN the Notes_List_Service SHALL fetch only the first page of notes (limited batch size)
2. WHEN the user scrolls to the bottom of the Notes_List_Container THEN the Notes_List_Service SHALL fetch the next page of notes
3. WHEN additional notes are fetched THEN the Notes_Page SHALL append the new notes to the existing list without replacing previous notes
4. WHEN there are no more notes to fetch THEN the Notes_Page SHALL display an "end of list" message at the bottom of the container
5. WHILE notes are being fetched THEN the Notes_Page SHALL display a loading indicator

### Requirement 5

**User Story:** As a user, I want visual feedback when scrolling through my notes, so that I can understand my position in the list.

#### Acceptance Criteria

1. WHEN the Notes_List_Container has content above the visible area THEN the ScrollShadow component SHALL display a shadow at the top
2. WHEN the Notes_List_Container has content below the visible area THEN the ScrollShadow component SHALL display a shadow at the bottom
3. WHEN the Notes_List_Container is scrolled to the top THEN the ScrollShadow component SHALL hide the top shadow
4. WHEN the Notes_List_Container is scrolled to the bottom THEN the ScrollShadow component SHALL hide the bottom shadow
