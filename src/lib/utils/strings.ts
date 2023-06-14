export function toKebabCase(str: string): string {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2') // Convert camelCase to kebab-case
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .toLowerCase(); // Convert to lowercase
}