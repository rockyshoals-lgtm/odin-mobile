# ODIN Mobile ↔ Web Integration (Phase 1)

**Date:** February 26, 2026
**Version:** 1.2.0
**Engine:** v10.69

---

## Overview

Phase 1 implements four foundational features that connect the ODIN mobile app (React Native + Expo) with the pdufa.bio website (Next.js):

1. **Unified Data API** — Single source of truth for catalyst data
2. **Deep Linking** — Seamless navigation between mobile and web
3. **View on Web** — One-tap to open catalyst details in browser
4. **Analytics Foundation** — Cross-platform event tracking

---

## 1. Unified Data API (`catalystApiService.ts`)

### How It Works

On app launch, `fetchCatalysts()` follows this priority chain:

```
1. Check AsyncStorage cache (key: odin-catalysts-cache-v10-69)
   ├── If cache exists AND age < 1 hour → Return cached data
   └── If cache missing or stale → Continue to step 2

2. Fetch from https://pdufa.bio/api/catalysts-v10-69.json
   ├── If success → Cache response, return fresh data
   └── If fails → Continue to step 3

3. Try stale cache (any age)
   ├── If available → Return stale cached data
   └── If no cache → Continue to step 4

4. Return bundled CATALYSTS_DATA (always available offline)
```

### API Response Format

```json
{
  "version": "10.69",
  "updated_at": "2026-02-26T18:00:00Z",
  "catalysts": [ ...Catalyst[] ]
}
```

### Key Files

| File | Purpose |
|------|---------|
| `src/services/catalystApiService.ts` | Fetch + cache + fallback logic |
| `src/constants/catalysts.ts` | Bundled fallback data (6,992 lines) |

### Testing Offline Mode

1. Enable airplane mode on device
2. Launch app — should load bundled data
3. Disable airplane mode, pull to refresh
4. Console should show `[CatalystAPI] Fetching from API...`

### Force Refresh

```ts
import { refreshCatalysts } from './services/catalystApiService';
await refreshCatalysts(); // Clears cache and re-fetches
```

---

## 2. Deep Linking (`useDeepLinking.ts` + `app.json`)

### Supported URL Patterns

| URL Pattern | Screen | Example |
|-------------|--------|---------|
| `odin://catalyst/:id` | CatalystDetail | `odin://catalyst/aldx-reproxalap-2026-03-16` |
| `odin://watchlist` | Watchlist | `odin://watchlist` |
| `odin://home` | Catalysts (Home) | `odin://home` |
| `odin://track-record` | TrackRecord | `odin://track-record` |
| `https://pdufa.bio/catalyst/:id` | CatalystDetail | `https://pdufa.bio/catalyst/aldx-reproxalap-2026-03-16` |
| `https://pdufa.bio/track-record` | TrackRecord | `https://pdufa.bio/track-record` |
| `https://pdufa.bio/pdufa-calendar` | Catalysts (Home) | — |

### Testing Deep Links

**In Expo Go (development):**
```bash
# Custom scheme
npx uri-scheme open "odin://catalyst/aldx-reproxalap-2026-03-16" --ios
npx uri-scheme open "odin://watchlist" --android

# Or use Linking API in console
expo-linking open odin://catalyst/aldx-reproxalap-2026-03-16
```

**In standalone build:**
```bash
# iOS
xcrun simctl openurl booted "odin://catalyst/aldx-reproxalap-2026-03-16"

# Android
adb shell am start -a android.intent.action.VIEW -d "odin://catalyst/aldx-reproxalap-2026-03-16"
```

### Configuration Changes

**app.json additions:**
- `"scheme": "odin"` — Registers `odin://` URL scheme
- `ios.associatedDomains` — Enables iOS Universal Links for pdufa.bio
- `android.intentFilters` — Enables Android App Links for pdufa.bio

### Server-Side Requirements (for Universal Links)

To enable Universal Links (iOS) and App Links (Android), deploy these files to pdufa.bio:

**`public/.well-known/apple-app-site-association`:**
```json
{
  "applinks": {
    "apps": [],
    "details": [{
      "appIDs": ["TEAM_ID.com.pdufa.odin"],
      "paths": ["/catalyst/*", "/track-record"]
    }]
  }
}
```

**`public/.well-known/assetlinks.json`:**
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.pdufa.odin",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
  }
}]
```

---

## 3. View on Web (`ViewOnWebButton.tsx`)

### Usage

```tsx
import { ViewOnWebButton } from '../components/ViewOnWebButton';

<ViewOnWebButton
  catalystId="aldx-reproxalap-2026-03-16"
  ticker="ALDX"
/>
```

### Variants

- **Default:** Full-width button with globe icon and arrow
- **Compact:** `compact={true}` for inline usage in tight spaces

### Behavior

1. User taps button
2. Haptic feedback fires (light impact)
3. Analytics event `web_link_opened` is tracked
4. Browser opens `https://pdufa.bio/{ticker}-pdufa`

---

## 4. Analytics Foundation (`analyticsService.ts`)

### Tracked Events

| Event | Properties | When |
|-------|-----------|------|
| `app_launched` | `dataSource` | App startup |
| `catalyst_viewed` | `catalystId`, `ticker`, `tier` | Open catalyst detail |
| `catalyst_added_to_watchlist` | `catalystId`, `ticker`, `tier` | Add to watchlist |
| `catalyst_removed_from_watchlist` | `catalystId`, `ticker`, `tier` | Remove from watchlist |
| `web_link_opened` | `catalystId`, `ticker`, `url` | Tap "View on Web" |
| `deep_link_received` | `url`, `screen`, `catalystId` | Incoming deep link |
| `filter_applied` | `filterType`, `filterValue` | Change filter |
| `api_fetch_completed` | `dataSource`, `duration` | API fetch done |
| `screen_viewed` | `screen` | Navigate to screen |
| `prediction_submitted` | `catalystId`, `ticker` | Vote on outcome |
| `search_performed` | `query` | Search catalysts |
| `trade_executed` | `ticker` | Paper trade |

### Verifying Events

Events log to console in development mode:

```
[Analytics] app_launched { dataSource: 'api', platform: 'ios', appVersion: '1.2.0', ... }
[Analytics] catalyst_viewed { catalystId: 'aldx-reproxalap-2026-03-16', ticker: 'ALDX', tier: 'TIER_1', ... }
[Analytics] web_link_opened { url: 'https://pdufa.bio/aldx-pdufa', ... }
```

### Adding GA4/Mixpanel Later

In `analyticsService.ts`, replace the console.log block in `trackEvent()`:

```ts
// GA4
import analytics from '@react-native-firebase/analytics';
await analytics().logEvent(event, payload.properties);

// Mixpanel
import { Mixpanel } from 'mixpanel-react-native';
mixpanel.track(event, payload.properties);
```

### Anonymous User ID

- Generated on first launch as a v4 UUID
- Stored in AsyncStorage (`odin-analytics-user-id`)
- Persists across app restarts
- Reset via `resetAnalytics()` in Settings

---

## Troubleshooting

### "API failed, using bundled data"
- Check network connectivity
- Verify `https://pdufa.bio/api/catalysts-v10-69.json` is accessible
- Check if the API endpoint returns valid JSON

### Deep links not working in Expo Go
- Custom scheme works: `exp+odin-mobile://catalyst/...`
- Universal Links require standalone build (not Expo Go)
- Test with `npx uri-scheme open` command

### Analytics events not appearing
- Check `__DEV__` flag — events only log in development
- Ensure `initAnalytics()` was called before `trackEvent()`
- Check console for `[Analytics]` prefix

### ViewOnWebButton shows "Unable to Open"
- Verify the URL scheme (`https://`) is correct
- Check if a browser is available on the device
- In simulator, web URLs always work

---

## File Structure

```
src/
├── services/
│   ├── catalystApiService.ts    ← NEW: API fetch + cache
│   ├── analyticsService.ts      ← NEW: Event tracking
│   └── [existing services]
├── hooks/
│   ├── useDeepLinking.ts        ← NEW: URL handler
│   └── [existing hooks]
├── components/
│   ├── ViewOnWebButton.tsx      ← NEW: Browser link button
│   └── [existing components]
├── screens/
│   └── Catalysts/
│       └── CatalystDetail.tsx   ← UPDATED: +ViewOnWebButton, +analytics
└── App.tsx                      ← UPDATED: +API fetch, +deep links, +analytics
app.json                         ← UPDATED: +scheme, +associatedDomains, +intentFilters
```

---

## Next Steps (Phase 2)

1. Deploy `catalysts-v10-69.json` endpoint on pdufa.bio
2. Deploy `.well-known` files for Universal Links / App Links
3. Add GA4 or Mixpanel SDK for production analytics
4. Implement optional authentication (Firebase/Supabase)
5. Add watchlist sync across platforms
