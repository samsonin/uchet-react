# Grouped SMS Gateway Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show one SMS Gateway journal card per SMS command, with expandable status history.

**Architecture:** A pure frontend helper groups descending audit events by `command_id` and retains standalone system events. The SMS phone page renders each group as an accordion summary with the latest state and a detail list of earlier state transitions.

**Tech Stack:** React, Material UI, Jest/react-scripts.

## Global Constraints

- Show the SMS text only once per command group.
- Keep standalone events without `command_id` separate.
- Show the latest status and time before expansion; expanded content has earlier statuses and their times.
- Fetch at most 30 raw events and show at most five resulting groups.
- Work directly on `master`, as explicitly requested by the user.

---

### Task 1: Group audit events by SMS command

**Files:**
- Create: `src/components/smsGatewayAudit.js`
- Create: `src/components/smsGatewayAudit.test.js`

**Interfaces:**
- Produces: `groupSmsGatewayAuditEvents(events)` returning `{key, latest, message, events, isSms}` entries in source order.

- [x] **Step 1: Write the failing test**

```js
const groups = groupSmsGatewayAuditEvents([
    {id: 4, command_id: 'sms-1', event_type: 'result_delivered', message: 'Заказ принят', created_at: '2026-08-07T06:49:36Z'},
    {id: 3, command_id: 'sms-1', event_type: 'result_sent', message: 'Заказ принят', created_at: '2026-08-07T06:49:35Z'},
    {id: 2, command_id: 'sms-1', event_type: 'sent_to_fcm', message: 'Заказ принят', created_at: '2026-08-07T06:49:31Z'},
    {id: 1, event_type: 'pairing_code_created', created_at: '2026-08-06T12:44:50Z'},
]);

expect(groups).toHaveLength(2);
expect(groups[0]).toMatchObject({isSms: true, message: 'Заказ принят', latest: {event_type: 'result_delivered'}});
expect(groups[0].events).toHaveLength(3);
expect(groups[1]).toMatchObject({isSms: false, latest: {event_type: 'pairing_code_created'}});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx react-scripts test --watchAll=false --runInBand src/components/smsGatewayAudit.test.js`

Expected: FAIL because `groupSmsGatewayAuditEvents` does not exist.

- [x] **Step 3: Write minimal implementation**

```js
export const groupSmsGatewayAuditEvents = events => events.reduce((groups, event) => {
    const key = event.command_id ? `command:${event.command_id}` : `event:${event.id}`;
    const group = groups.find(item => item.key === key);

    if (group) group.events.push(event);
    else groups.push({key, latest: event, message: event.message || '', events: [event], isSms: Boolean(event.command_id)});

    return groups;
}, []);
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx react-scripts test --watchAll=false --runInBand src/components/smsGatewayAudit.test.js`

Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add src/components/smsGatewayAudit.js src/components/smsGatewayAudit.test.js
git commit -m "feat: group sms gateway audit events"
```

### Task 2: Render grouped, expandable SMS history

**Files:**
- Modify: `src/components/IntegrationSmsPhone.js:1-330`
- Test: `src/components/smsGatewayAudit.test.js`

**Interfaces:**
- Consumes: `groupSmsGatewayAuditEvents(events)` from Task 1.
- Produces: journal summaries with one message and details containing prior status-time transitions.

- [x] **Step 1: Extend the failing test**

```js
expect(groups[0].events.slice(1).map(event => event.event_type)).toEqual([
    'result_sent',
    'sent_to_fcm',
]);
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx react-scripts test --watchAll=false --runInBand src/components/smsGatewayAudit.test.js`

Expected: FAIL because the helper does not preserve earlier transitions.

- [x] **Step 3: Render the groups**

```js
const auditGroups = groupSmsGatewayAuditEvents(auditEvents);

{auditGroups.slice(0, 5).map(group => <Accordion key={group.key}>
    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>...</AccordionSummary>
    <AccordionDetails>{group.events.slice(1).map(event => ...)}</AccordionDetails>
</Accordion>)}
```

- [x] **Step 4: Run focused tests and production build**

Run: `npx react-scripts test --watchAll=false --runInBand src/components/smsGatewayAudit.test.js src/components/IntegrationSmsPhone.test.js`

Run: `npm run build`

Expected: all focused tests and the production build pass.

- [x] **Step 5: Commit**

```bash
git add src/components/IntegrationSmsPhone.js src/components/smsGatewayAudit.test.js
git commit -m "feat: collapse sms status history"
```
