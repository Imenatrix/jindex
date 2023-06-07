export function getEmbed(uri : string) : string {
    const coiso = uri.replace('http://', '//').replace('https://', '//')

    return `<video class="video-js" data-setup='{}' controls autoplay>
    <source src="${coiso}">
</video>
`
}