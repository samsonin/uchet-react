import {groupSmsGatewayAuditEvents} from './smsGatewayAudit';

describe('SMS Gateway audit grouping', () => {
    test('groups status transitions of one SMS while keeping system events separate', () => {
        const groups = groupSmsGatewayAuditEvents([
            {id: 4, command_id: 'sms-1', event_type: 'result_delivered', message: 'Заказ принят', created_at: '2026-08-07T06:49:36Z'},
            {id: 3, command_id: 'sms-1', event_type: 'result_sent', message: 'Заказ принят', created_at: '2026-08-07T06:49:35Z'},
            {id: 2, command_id: 'sms-1', event_type: 'sent_to_fcm', message: 'Заказ принят', created_at: '2026-08-07T06:49:31Z'},
            {id: 1, event_type: 'pairing_code_created', created_at: '2026-08-06T12:44:50Z'},
        ]);

        expect(groups).toHaveLength(2);
        expect(groups[0]).toMatchObject({
            isSms: true,
            message: 'Заказ принят',
            latest: {event_type: 'result_delivered'},
        });
        expect(groups[0].events).toHaveLength(3);
        expect(groups[1]).toMatchObject({
            isSms: false,
            latest: {event_type: 'pairing_code_created'},
        });
    });
});
