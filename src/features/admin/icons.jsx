const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
}

export function ShieldIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

export function ReportIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </svg>
  )
}

export function WarningIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M10.3 4.3L2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 4.3a2 2 0 00-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  )
}

export function WeatherIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M17.5 15a4 4 0 00-1.6-7.7 6 6 0 10-9.7 5.7" />
      <path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2" />
    </svg>
  )
}

export function LogoutIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}

export function CheckIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

export function InboxIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.4 5.8L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.4-6.2A2 2 0 0016.8 5H7.2a2 2 0 00-1.8.8z" />
    </svg>
  )
}
