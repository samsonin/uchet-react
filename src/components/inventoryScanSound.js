export const inventoryScanSoundUrl = result => {
    if (result === 'accounted') return '/sounds/success.wav';
    if (result === 'network_error') return '/sounds/danger.wav';

    return '/sounds/warning.wav';
};

export const inventoryScanSound = result => {
    const audio = new Audio(inventoryScanSoundUrl(result));

    audio.play().catch(() => undefined);
};
