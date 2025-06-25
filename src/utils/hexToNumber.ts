export function hexToNumber(hex: string): number {
    // Remove prefixes like "#", "0x", or "0X"
    if (hex.startsWith("#")) {
        hex = hex.slice(1);
    } else if (hex.startsWith("0x") || hex.startsWith("0X")) {
        hex = hex.slice(2);
    }

    // Parse base-16
    return parseInt(hex, 16);
}