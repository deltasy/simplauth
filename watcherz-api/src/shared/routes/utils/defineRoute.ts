export const defineRoute = (base: string, prefix: string, relative: string) => ({
    raw: base + relative,
    relative_with_prefix: prefix + relative,
    relative
})