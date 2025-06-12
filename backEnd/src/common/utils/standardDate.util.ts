export function generateDate(minutes: number = 0): Date {

    const offSet = minutes * 60_000;

    return new Date(Date.now() + offSet);
}

export function convertToDateGMT7Format(date: Date) {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Bangkok',
        year:   'numeric',
        month:  '2-digit',
        day:    '2-digit',
        hour:   '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).formatToParts(date);

    const map: Record<string, string> = {};
    for (const p of parts) {
        map[p.type] = p.value;
    }

    // Return "HH:MM:SS DD-MM-YYYY"
    return `${map.hour}:${map.minute}:${map.second} ${map.day}-${map.month}-${map.year}`;
}
