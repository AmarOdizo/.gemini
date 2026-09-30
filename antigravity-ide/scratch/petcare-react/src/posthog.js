import posthog from 'posthog-js'

const posthogKey = import.meta.env.VITE_POSTHOG_KEY
const posthogHost = import.meta.env.VITE_POSTHOG_HOST

export const isPostHogEnabled = Boolean(posthogKey && posthogHost)

if (!isPostHogEnabled) {
  const missingVariable = posthogKey ? 'VITE_POSTHOG_HOST' : 'VITE_POSTHOG_KEY'

  if (import.meta.env.DEV) {
    throw new Error(
      `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
    )
  }
} else {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    defaults: '2026-05-30',
    logs: {
      serviceName: 'petcare-web',
      environment: import.meta.env.MODE,
    },
    capture_exceptions: {
      capture_unhandled_errors: true,
      capture_unhandled_rejections: true,
      capture_console_errors: false,
    },
  })
}

export const identifyUser = (user) => {
  const distinctId = user?._id || user?.id

  if (!isPostHogEnabled || !distinctId) {
    return
  }

  const personProperties = {
    ...(user.role && { role: user.role }),
    ...(user.email && { email: user.email }),
    ...(user.name && { name: user.name }),
  }

  posthog.identify(String(distinctId), personProperties)
}

export const resetPostHog = () => {
  if (isPostHogEnabled) {
    posthog.reset()
  }
}

export const posthogLog = {
  info(message, attributes) {
    if (isPostHogEnabled) {
      posthog.logger.info(message, attributes)
    }
  },
}

export default posthog
