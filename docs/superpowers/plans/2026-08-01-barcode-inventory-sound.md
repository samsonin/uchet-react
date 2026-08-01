# Barcode Inventory Sound Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Play the legacy inventory WAV feedback sounds after each barcode scan on `/barcode-inventory`.

**Architecture:** Legacy WAV files are served from React's `public/sounds` directory. A focused helper maps scan outcomes to those URLs and creates a fresh browser `Audio` instance, while the inventory page invokes it after the existing snackbar logic.

**Tech Stack:** React, Jest/react-scripts, browser Audio API.

## Global Constraints

- Reuse the unchanged legacy `success.wav`, `warning.wav`, and `danger.wav` files.
- Preserve the existing snackbar messages and do not block inventory processing if audio playback fails.
- Work directly on `master`, as explicitly requested by the user.

---

### Task 1: Inventory scan audio helper

**Files:**
- Create: `src/components/inventoryScanSound.js`
- Create: `src/components/inventoryScanSound.test.js`
- Create: `public/sounds/success.wav`
- Create: `public/sounds/warning.wav`
- Create: `public/sounds/danger.wav`

**Interfaces:**
- Produces: `inventoryScanSound(result)` which plays the matching legacy file for `accounted`, rejected scan results, and network errors.

- [x] **Step 1: Write the failing test**

```js
import {inventoryScanSound, inventoryScanSoundUrl} from './inventoryScanSound';

test('maps a successfully accounted scan to the legacy success sound', () => {
    expect(inventoryScanSoundUrl('accounted')).toBe('/sounds/success.wav');
});

test('plays a warning sound for a rejected scan', () => {
    global.Audio = jest.fn(() => ({play: jest.fn(() => Promise.resolve())}));

    inventoryScanSound('duplicate');

    expect(global.Audio).toHaveBeenCalledWith('/sounds/warning.wav');
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx react-scripts test --watchAll=false --runInBand src/components/inventoryScanSound.test.js`

Expected: FAIL because `inventoryScanSound` is not defined.

- [x] **Step 3: Write minimal implementation**

```js
export const inventoryScanSoundUrl = result => result === 'accounted'
    ? '/sounds/success.wav'
    : result === 'network_error'
        ? '/sounds/danger.wav'
        : '/sounds/warning.wav';

export const inventoryScanSound = result => {
    const audio = new Audio(inventoryScanSoundUrl(result));
    audio.play().catch(() => undefined);
};
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx react-scripts test --watchAll=false --runInBand src/components/inventoryScanSound.test.js`

Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add public/sounds src/components/inventoryScanSound.js src/components/inventoryScanSound.test.js
git commit -m "feat: add inventory scan sounds"
```

### Task 2: Connect audio to inventory scan results

**Files:**
- Modify: `src/components/BarcodeInventoryPage.js:21-105`
- Test: `src/components/inventoryScanSound.test.js`

**Interfaces:**
- Consumes: `inventoryScanSound(result)` from `inventoryScanSound.js`.
- Produces: successful, rejected, and failed requests trigger their corresponding sound after scan handling.

- [x] **Step 1: Extend the failing test**

```js
test('maps a network failure to the legacy danger sound', () => {
    expect(inventoryScanSoundUrl('network_error')).toBe('/sounds/danger.wav');
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx react-scripts test --watchAll=false --runInBand src/components/inventoryScanSound.test.js`

Expected: FAIL because `network_error` is mapped to the warning file.

- [x] **Step 3: Connect the page**

```js
if (res.status === 200 && res.body?.result === 'accounted') {
    inventoryScanSound('accounted');
} else {
    inventoryScanSound(res.body?.result);
}
// Add .catch(() => inventoryScanSound('network_error')) to the scan request.
```

- [x] **Step 4: Run focused tests and production build**

Run: `npx react-scripts test --watchAll=false --runInBand src/components/inventoryScanSound.test.js src/components/barcodeInventory.test.js src/components/BarcodeInventoryNavigation.test.js`

Run: `npm run build`

Expected: all focused tests and the production build pass.

- [x] **Step 5: Commit**

```bash
git add src/components/BarcodeInventoryPage.js src/components/inventoryScanSound.test.js
git commit -m "feat: play sounds for inventory scans"
```
