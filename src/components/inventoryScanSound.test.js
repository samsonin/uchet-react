import {inventoryScanSound, inventoryScanSoundUrl} from './inventoryScanSound';

describe('inventory scan sound', () => {
    const originalAudio = global.Audio;

    afterEach(() => {
        global.Audio = originalAudio;
    });

    test('maps a successfully accounted scan to the legacy success sound', () => {
        expect(inventoryScanSoundUrl('accounted')).toBe('/sounds/success.wav');
    });

    test('maps a network failure to the legacy danger sound', () => {
        expect(inventoryScanSoundUrl('network_error')).toBe('/sounds/danger.wav');
    });

    test('plays a warning sound for a rejected scan', () => {
        const play = jest.fn(() => Promise.resolve());
        global.Audio = jest.fn(() => ({play}));

        inventoryScanSound('duplicate');

        expect(global.Audio).toHaveBeenCalledWith('/sounds/warning.wav');
        expect(play).toHaveBeenCalledTimes(1);
    });
});
