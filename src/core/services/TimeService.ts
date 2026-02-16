export const TimeService = {
    toDateStr(date: Date | string, includeTime = false): string {
        if (!date) return '';
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime())) return String(date);
        if (includeTime) return d.toISOString();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    },

    normalizeRange(startStr: string, endStr: string) {
        const s = startStr.includes('T') ? startStr : `${startStr}T00:00:00.000Z`;
        const e = endStr.includes('T') ? endStr : `${endStr}T23:59:59.999Z`;
        return { start: s, end: e };
    },

    getPreviousPeriod(startStr: string, endStr: string) {
        const start = new Date(startStr);
        const end = new Date(endStr);
        const diff = Math.abs(end.getTime() - start.getTime());
        const prevEnd = new Date(start.getTime() - 1);
        const prevStart = new Date(prevEnd.getTime() - diff);
        return { start: prevStart.toISOString(), end: prevEnd.toISOString() };
    },

    getYearOverYear(startStr: string, endStr: string) {
        const start = new Date(startStr);
        const end = new Date(endStr);
        return {
            start: new Date(start.getFullYear() - 1, start.getMonth(), start.getDate()).toISOString(),
            end: new Date(end.getFullYear() - 1, end.getMonth(), end.getDate()).toISOString()
        };
    },

    getMonthBounds(baseDate: Date, monthsBack: number) {
        const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - monthsBack, 1);
        return {
            start: new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0).toISOString(),
            end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString()
        };
    }
};