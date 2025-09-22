// src/libs/jitsiConfig.js or src/libs/jitsiConfig.ts

// Commented out Jitsi configuration to prevent performance issues
// Exporting the jitsiConfig object
export const _jitsiConfig = {
  // Connection settings for the Jitsi server
  hosts: {
    domain: 'jitsi.tuhinmallick.com', // Your Jitsi server domain
    // muc: 'conference.jitsi.tuhinmallick.com', // Multi-user chat domain
  },
  bosh: 'https://jitsi.tuhinmallick.com/http-bind', // Explicitly use HTTPS
  websocket: 'wss://jitsi.tuhinmallick.com/xmpp-websocket', // WebSocket URL

  // Video quality settings
  resolution: 720, // Default video resolution
  constraints: {
    video: {
      height: {
        ideal: 720, // Ideal video height
        max: 720,   // Maximum video height
        min: 144,   // Minimum video height
      },
    },
  },

  // Behavior settings
  disableAudioLevels: false,        // Enable audio level monitoring
  enableNoAudioDetection: true,     // Enable detection of no audio input
  enableNoisyMicDetection: true,    // Enable detection of noisy microphones
  startAudioOnly: false,            // Start meeting with audio only
  startWithAudioMuted: true,        // Start meeting with audio muted
  startWithVideoMuted: true,        // Start meeting with video muted

  // Feature settings
  enableWelcomePage: false,  // Disable welcome page for direct room access

  enableClosePage: false,    // Disable close page after meeting ends
  // Commented out to prevent close screen
  // enableClosePage: true,    // Enable close page after meeting ends

  // prejoinPageEnabled: false, // Disable prejoin page for quicker access
  // Commented out conflicting prejoinConfig
  prejoinConfig: {
    enabled: true, // Enable prejoin screen
    hideDisplayName: false, // Show display name input on prejoin screen
    hideExtraJoinButtons: ['no-audio', 'by-phone'], // Hide specific join options
  },

  disableDeepLinking: false, // Allow deep linking into meetings

  // Security settings
  enableInsecureRoomNameWarning: false, // Warn about insecure room names
  enableE2EE: false,                    // Disable end-to-end encryption

  // UI settings
  hideConferenceSubject: true,   // Hide conference subject
  hideConferenceTimer: false,    // Show conference timer
  disableInviteFunctions: true,  // Enable invite functions
  filmStripOnly: false,          // Show full interface, not just filmstrip

  // Breakout room settings
  breakoutRooms: {
    hideAddRoomButton: false,    // Show button to add breakout rooms
    hideAutoAssignButton: false, // Show auto-assign button
    hideJoinRoomButton: false,   // Show join room button
  },

  // Recording settings
  recordingService: {
    enabled: true,        // Enable recording service
    sharingEnabled: false // Disable sharing of recordings
  },

  // Live streaming settings
  liveStreaming: {
    enabled: false,       // Disable live streaming
    dataChannelOpen: false // Disable data channel for streaming
  },

  // Transcription settings
  transcribingEnabled: true, // Enable transcription service

  // Lobby settings
  lobby: {
    autoKnock: false,  // Disable automatic knock for entry
    enableChat: true,  // Enable chat in the lobby
  },

  // Analytics settings
  analytics: {
    disabled: false, // Enable analytics
  },

  // New P2P settings
  p2p: {
    enabled: false,       // Disable peer-to-peer connections
    preferH264: false,    // Prefer H.264 codec for P2P connections
    disableH264: false,   // Don't disable H.264 codec
    useStunTurn: false    // Don't use STUN/TURN servers for P2P connections
  },

  // New Last N settings
  lastN: 20,      // Maximum number of videos to receive
  startLastN: 5,  // Initial number of videos to receive

  // New bandwidth constraints
  channelLastN: -1,      // No limit on the number of videos (-1 means unlimited)
  adaptiveLastN: true,   // Enable adaptive LastN

  // New virtual background settings
  virtualBackgroundOptions: {
    enabled: true,              // Enable virtual background feature
    backgroundEffectEnabled: true // Enable background effects by default
  },

  // New reactions settings
  reactions: {
    enabled: true,                 // Enable reactions feature
    enableReactionModeration: false // Disable moderation for reactions
  },

  // New whiteboard settings
  whiteboard: {
    enabled: true,                    // Enable whiteboard feature
    collabServerBaseUrl: 'https://your-collab-server-url' // Collaboration server URL
  },

  // New facial expressions settings
  facialExpressions: {
    enabled: true // Enable facial expressions detection
  },

  // New audio settings
  disableAP: false,             // Enable audio processing
  disableAEC: false,            // Enable acoustic echo cancellation
  disableNS: false,             // Enable noise suppression
  disableAGC: false,            // Enable automatic gain control
  audioLevelsInterval: 200,     // Interval for audio levels in milliseconds

  // New video settings
  disableSimulcast: false,        // Enable simulcast for video
  enableLayerSuspension: true,    // Enable layer suspension for bandwidth saving

  // New connection optimization settings
  enableTcc: true,   // Enable transport-wide congestion control
  enableRemb: true,  // Enable receiver estimated maximum bitrate

  // New moderator settings
  enableUserRolesBasedOnToken: false, // Disable user roles based on token

  // New polls settings
  polls: {
    enabled: true // Enable polls feature
  },

  // Interface configuration
  interfaceConfig: {
    TOOLBAR_BUTTONS: [
      'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
      'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
      'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
      'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
      'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
      'e2ee', 'security'
    ], // Buttons available in the toolbar
    SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'], // Sections in the settings menu
    VIDEO_LAYOUT_FIT: 'both',          // Video layout fit option
    SHOW_JITSI_WATERMARK: false,       // Hide Jitsi watermark
    SHOW_WATERMARK_FOR_GUESTS: false,  // Hide watermark for guests
    SHOW_BRAND_WATERMARK: false,       // Do not show brand watermark
    BRAND_WATERMARK_LINK: '',          // No link for brand watermark
    SHOW_POWERED_BY: false,            // Do not show "Powered by" text
    GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false, // Do not generate room names
    APP_NAME: 'Urban Company',         // Application name
    NATIVE_APP_NAME: 'Jitsi Meet',     // Native application name
    PROVIDER_NAME: 'Jitsi',            // Provider name
    LANG_DETECTION: true,              // Enable language detection
    INVITATION_POWERED_BY: false,      // Do not show "Powered by" in invitations
    AUTHENTICATION_ENABLE: false,      // Disable authentication
    TILE_VIEW_MAX_COLUMNS: 5,          // Maximum columns in tile view
    OPTIMAL_BROWSERS: ['chrome', 'chromium', 'firefox', 'nwjs', 'electron', 'safari'], // Optimized browsers
    UNSUPPORTED_BROWSERS: [],          // No unsupported browsers listed
    VERTICAL_FILMSTRIP: true,          // Enable vertical filmstrip

    // Commented out to prevent close screen from appearing
    // CLOSE_PAGE_GUEST_HINT: true,        // Show guest hint on close page
    // SHOW_PROMOTIONAL_CLOSE_PAGE: false, // Do not show promotional content on close page

    RANDOM_AVATAR_URL_PREFIX: false, // Disable random avatar URL prefix
    RANDOM_AVATAR_URL_SUFFIX: false, // Disable random avatar URL suffix
    FILM_STRIP_MAX_HEIGHT: 120,      // Maximum height for filmstrip
    ENABLE_FEEDBACK_ANIMATION: false, // Disable feedback animation
    DISABLE_FOCUS_INDICATOR: false,    // Enable focus indicator
    DISABLE_DOMINANT_SPEAKER_INDICATOR: false, // Enable dominant speaker indicator
    DISABLE_TRANSCRIPTION_SUBTITLES: false, // Enable transcription subtitles
    DISABLE_RINGING: false,           // Enable ringing
    AUDIO_LEVEL_PRIMARY_COLOR: 'rgba(255,255,255,0.4)', // Primary color for audio levels
    AUDIO_LEVEL_SECONDARY_COLOR: 'rgba(255,255,255,0.2)', // Secondary color for audio levels
    POLICY_LOGO: null,                // No policy logo
    LOCAL_THUMBNAIL_RATIO: 16 / 9,    // Ratio for local thumbnail
    REMOTE_THUMBNAIL_RATIO: 1,        // Ratio for remote thumbnail
    LIVE_STREAMING_HELP_LINK: 'https://jitsi.org/live', // Live streaming help link
    MOBILE_APP_PROMO: false,          // Disable mobile app promotion
    MAXIMUM_ZOOMING_COEFFICIENT: 1.3, // Maximum zooming coefficient
    SUPPORT_URL: 'https://community.jitsi.org/', // Support URL
    CONNECTION_INDICATOR_AUTO_HIDE_ENABLED: true, // Enable auto-hide for connection indicator
    CONNECTION_INDICATOR_AUTO_HIDE_TIMEOUT: 5000, // Auto-hide timeout in milliseconds
    VIDEO_QUALITY_LABEL_DISABLED: false, // Enable video quality label
    RECENT_LIST_ENABLED: true,        // Enable recent list
    AUTO_PIN_LATEST_SCREEN_SHARE: 'remote-only', // Auto-pin latest screen share for remote only
    DISABLE_PRESENCE_STATUS: false,   // Enable presence status
    DISABLE_JOIN_LEAVE_NOTIFICATIONS: false, // Enable join/leave notifications
    SHOW_CHROME_EXTENSION_BANNER: false, // Do not show Chrome extension banner
  },
};

// Adding named exports without removing any existing code or comments
export const configOverwrite = {
  ...jitsiConfig,
  // Exclude 'interfaceConfig' if necessary
};

export const interfaceConfigOverwrite = jitsiConfig.interfaceConfig;