export const groupSmsGatewayAuditEvents = events => events.reduce((groups, event) => {
    const key = event.command_id ? `command:${event.command_id}` : `event:${event.id}`;
    const group = groups.find(item => item.key === key);

    if (group) {
        group.events.push(event);
        if (!group.message && event.message) group.message = event.message;
        return groups;
    }

    groups.push({
        key,
        latest: event,
        message: event.message || '',
        events: [event],
        isSms: Boolean(event.command_id),
    });

    return groups;
}, []);
