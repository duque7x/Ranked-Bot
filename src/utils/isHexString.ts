export function isHexString(str: string): boolean {
    return /^(\#|0x)?[0-9a-fA-F]+$/.test(str);
}