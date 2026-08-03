# Unified Inventory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve ordinary and barcode inventory from one `/inventory` page with a scanner checkbox at the top.

**Architecture:** A new `UnifiedInventory` container owns the scanner-enabled state and renders one existing inventory component at a time. `App` routes both current URLs to that container, preserving old barcode links through a redirect, while navigation exposes only the unified route.

**Tech Stack:** React, React Router, Redux, Material UI, Jest/react-scripts.

## Global Constraints

- The first visible control is the checkbox text `Включить сканер`.
- Scanner is off by default and keeps ordinary inventory unchanged.
- Scanner mode reuses the existing barcode inventory behavior and audio feedback.
- Work directly on `master`, as explicitly requested by the user.

---

### Task 1: Unified inventory mode container

**Files:**
- Create: `src/components/UnifiedInventory.js`
- Create: `src/components/UnifiedInventory.test.js`

**Interfaces:**
- Consumes: `newScan` and `setOurBarcode` props from `App`.
- Produces: a checkbox-controlled view rendering `Inventory` when disabled and `BarcodeInventoryPage` when enabled.

- [ ] **Step 1: Write the failing test**

```js
test('starts in ordinary inventory mode and switches to barcode inventory after enabling scanner', async () => {
    root.render(<UnifiedInventory app={{current_stock_id: 1}}/>);

    expect(container.textContent).toContain('Обычная инвентаризация');
    expect(container.textContent).toContain('Включить сканер');

    await act(async () => checkbox.click());

    expect(container.textContent).toContain('Инвентаризация по штрих-кодам');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx react-scripts test --watchAll=false --runInBand src/components/UnifiedInventory.test.js`

Expected: FAIL because `UnifiedInventory` does not exist.

- [ ] **Step 3: Write minimal implementation**

```js
const [scannerEnabled, setScannerEnabled] = useState(false);

return <>
    <FormControlLabel control={<Checkbox checked={scannerEnabled} onChange={event => setScannerEnabled(event.target.checked)}/>} label="Включить сканер"/>
    {scannerEnabled ? <BarcodeInventoryPage {...props}/> : <Inventory {...props}/>} 
</>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx react-scripts test --watchAll=false --runInBand src/components/UnifiedInventory.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/UnifiedInventory.js src/components/UnifiedInventory.test.js
git commit -m "feat: add unified inventory mode switch"
```

### Task 2: Route and navigation consolidation

**Files:**
- Modify: `src/App.js:505-512`
- Modify: `src/components/SiteMap.js:15-45`
- Modify: `src/components/BarcodeInventoryNavigation.test.js`

**Interfaces:**
- Consumes: `UnifiedInventory` from Task 1.
- Produces: `/inventory` unified route, `/barcode-inventory` redirect, and one inventory navigation item.

- [ ] **Step 1: Extend the failing navigation test**

```js
expect(siteMap(false, 1)).toContainEqual(
    expect.objectContaining({path: 'inventory', text: 'Инвентаризация'}),
);
expect(siteMap(false, 1)).not.toContainEqual(
    expect.objectContaining({path: 'barcode-inventory'}),
);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx react-scripts test --watchAll=false --runInBand src/components/BarcodeInventoryNavigation.test.js`

Expected: FAIL because navigation still includes `barcode-inventory`.

- [ ] **Step 3: Update the route and map**

```js
<Route path="/inventory" element={routeElement(UnifiedInventory, {newScan: ourBarcode, setOurBarcode})} />
<Route path="/barcode-inventory" element={<Navigate replace to="/inventory" />} />
```

- [ ] **Step 4: Run focused tests and production build**

Run: `npx react-scripts test --watchAll=false --runInBand src/components/UnifiedInventory.test.js src/components/BarcodeInventoryNavigation.test.js src/components/barcodeInventory.test.js src/components/BarcodeInventoryPage.sound.test.js src/components/inventoryScanSound.test.js`

Run: `npm run build`

Expected: all focused tests and the production build pass.

- [ ] **Step 5: Commit**

```bash
git add src/App.js src/components/SiteMap.js src/components/BarcodeInventoryNavigation.test.js
git commit -m "feat: unify inventory routes"
```
