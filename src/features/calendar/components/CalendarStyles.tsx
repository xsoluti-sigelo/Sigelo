'use client'

export function CalendarStyles() {
  return (
    <style jsx global>{`
      .calendar-container .rbc-calendar {
        font-family: inherit;
      }

      .rbc-header {
        padding: 12px 4px;
        font-weight: 600;
        color: rgb(55 65 81);
      }

      .dark .rbc-header {
        color: rgb(243 244 246);
        border-color: rgb(55 65 81);
      }

      .dark .rbc-off-range-bg {
        background: rgb(17 24 39);
      }

      .dark .rbc-today {
        background-color: rgb(31 41 55);
      }

      .dark .rbc-event {
        background-color: rgb(20 184 166);
      }

      .dark .rbc-month-view,
      .dark .rbc-time-view,
      .dark .rbc-agenda-view {
        border-color: rgb(55 65 81);
      }

      .dark .rbc-month-row,
      .dark .rbc-day-bg,
      .dark .rbc-time-header-content,
      .dark .rbc-time-content {
        border-color: rgb(55 65 81);
      }

      .dark .rbc-day-slot .rbc-time-slot {
        border-color: rgb(55 65 81);
      }

      .rbc-toolbar button {
        color: rgb(55 65 81);
        border-color: rgb(209 213 219);
        transition: all 0.2s ease;
        font-weight: 500;
      }

      .dark .rbc-toolbar button {
        color: rgb(243 244 246);
        border-color: rgb(55 65 81);
      }

      .rbc-toolbar button:hover {
        background-color: rgb(243 244 246);
        transform: translateY(-1px);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .dark .rbc-toolbar button:hover {
        background-color: rgb(31 41 55);
      }

      .rbc-toolbar button.rbc-active {
        background-color: rgb(20 184 166);
        color: white;
        border-color: rgb(20 184 166);
      }

      .dark .rbc-toolbar button.rbc-active {
        background-color: rgb(20 184 166);
        color: white;
        border-color: rgb(20 184 166);
      }

      .rbc-agenda-view {
        overflow-y: auto;
      }

      .rbc-agenda-content {
        overflow-y: visible;
      }

      .rbc-agenda-table {
        width: 100%;
      }

      .calendar-container::-webkit-scrollbar {
        width: 8px;
      }

      .calendar-container::-webkit-scrollbar-track {
        background: rgb(243 244 246);
        border-radius: 4px;
      }

      .dark .calendar-container::-webkit-scrollbar-track {
        background: rgb(31 41 55);
      }

      .calendar-container::-webkit-scrollbar-thumb {
        background: rgb(209 213 219);
        border-radius: 4px;
      }

      .dark .calendar-container::-webkit-scrollbar-thumb {
        background: rgb(55 65 81);
      }

      .calendar-container::-webkit-scrollbar-thumb:hover {
        background: rgb(156 163 175);
      }

      .dark .calendar-container::-webkit-scrollbar-thumb:hover {
        background: rgb(75 85 99);
      }

      .rbc-month-view {
        overflow: visible;
      }

      .rbc-month-row {
        overflow: visible;
        min-height: 100px;
        max-height: 140px;
      }

      .rbc-row-content {
        position: relative;
        z-index: 1;
      }

      .rbc-row-content-scroll-container {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .rbc-row-segment {
        padding: 1px 2px;
      }

      .rbc-day-bg {
        position: relative;
      }

      .rbc-date-cell {
        padding: 4px;
        font-size: 0.875rem;
      }

      .rbc-date-cell-custom {
        font-weight: 600;
        color: rgb(75 85 99);
      }

      .dark .rbc-date-cell-custom {
        color: rgb(209 213 219);
      }

      .rbc-day-bg + .rbc-row-content {
        max-height: 120px;
      }

      .rbc-event {
        font-size: 0.75rem;
        padding: 3px 6px;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .rbc-event:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        opacity: 1 !important;
      }

      .rbc-show-more {
        background-color: transparent;
        color: rgb(20 184 166);
        font-weight: 500;
        font-size: 0.75rem;
        padding: 2px 4px;
        margin-top: 2px;
        cursor: pointer;
        z-index: 10;
        position: relative;
      }

      .rbc-show-more:hover {
        text-decoration: underline;
        color: rgb(13 148 136);
      }

      .dark .rbc-show-more {
        color: rgb(45 212 191);
      }

      .dark .rbc-show-more:hover {
        color: rgb(94 234 212);
      }

      .rbc-overlay {
        background-color: white;
        border: 1px solid rgb(229 231 235);
        border-radius: 8px;
        box-shadow:
          0 10px 15px -3px rgb(0 0 0 / 0.1),
          0 4px 6px -4px rgb(0 0 0 / 0.1);
        padding: 8px;
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
      }

      .dark .rbc-overlay {
        background-color: rgb(31 41 55);
        border-color: rgb(55 65 81);
      }

      .rbc-overlay-header {
        padding: 8px;
        font-weight: 600;
        border-bottom: 1px solid rgb(229 231 235);
        margin-bottom: 8px;
      }

      .dark .rbc-overlay-header {
        border-bottom-color: rgb(55 65 81);
      }

      .rbc-overlay .rbc-event {
        margin-bottom: 4px;
        width: 100%;
      }

      .rbc-time-content {
        overflow-y: auto;
      }

      .rbc-time-slot {
        min-height: 40px;
      }

      .rbc-timeslot-group {
        min-height: 80px;
      }

      .rbc-day-slot .rbc-events-container {
        margin-right: 10px;
      }

      .rbc-day-slot .rbc-event {
        border: none;
        padding: 4px 6px;
      }
    `}</style>
  )
}
