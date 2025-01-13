# watchy

Add a dashboard to your server running Docker by adding a `watchy` service to it
and annotating the container with the labels to expose it.

```yaml
services:
  watchy:
    image: ghcr.io/wyattjoh/watchy:latest
    ports:
      - 3000:3000
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
```

Or with `docker run`:

```bash
docker run -d --name watchy --restart unless-stopped -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  ghcr.io/wyattjoh/watchy:latest
```

Then you can use the wizard on the screen to configure your services.

## Widgets

Widgets in Watchy are created by setting the `type` option to one of the
available widget types:

- `beszel` - Show active hosts in [Beszel](https://beszel.dev/) and their stats
  - `WIDGET_${id.toUpperCase().replace(/-/g, "_")}_BESZEL_ACCESS_TOKEN` - The
    access token for the Beszel API.
- `plex` - Show currently playing media in [Plex](https://plex.tv/)
  - `WIDGET_${id.toUpperCase().replace(/-/g, "_")}_PLEX_ACCESS_TOKEN` - The
    access token for the Plex API.
- `radarr` - Show currently playing media in [Radarr](https://radarr.video/)
  - `WIDGET_${id.toUpperCase().replace(/-/g, "_")}_RADARR_API_KEY` - The API
    key for the Radarr API.
- `sonarr` - Show currently playing media in [Sonarr](https://sonarr.tv/)
  - `WIDGET_${id.toUpperCase().replace(/-/g, "_")}_SONARR_API_KEY` - The API
    key for the Sonarr API.
- `nzbget` - Show the status of [NZBGet](https://nzbget.net/)
  - `WIDGET_${id.toUpperCase().replace(/-/g, "_")}_NZBGET_RESTRICTED_USERNAME` -
    The username for the NZBGet API.
  - `WIDGET_${id.toUpperCase().replace(/-/g, "_")}_NZBGET_RESTRICTED_PASSWORD` -
    The password for the NZBGet API.

If you configure a widget, you will also need to provide any secrets that they
require. They are keyed based on the service `id` that's configured. So if you
have a radarr service with an id of `radarr`, you will need to set the
`WIDGET_RADARR_RADARR_API_KEY` environment variable.

## Contributing

To run the development server, you can use `npm run dev`. Any widgets can be
added to the `src/components/widgets` directory and then added to the
`src/components/widgets.tsx` file. Follow the existing widgets as a guide for
how to implement them.

This project is built using [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)
with components from [shadcn/ui](https://ui.shadcn.com/).
