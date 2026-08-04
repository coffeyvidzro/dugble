export function isValidDomain(value: string): boolean {
    const pattern = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.[a-z0-9-]{1,63})+$/i;
    return pattern.test(value.trim());
}
