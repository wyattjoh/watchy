import { fetch } from "undici";
import { getService } from "@/lib/docker";
import path from "node:path";

export const dynamic = "force-dynamic";

export interface PlexWidgetData {
  MediaContainer: MediaContainer;
}

interface MediaContainer {
  size: number;
  Metadata?: MetadataItem[];
}

interface MetadataItem {
  addedAt: number;
  art: string;
  audienceRating: number;
  audienceRatingImage: string;
  chapterSource: string;
  contentRating: string;
  duration: number;
  grandparentArt: string;
  grandparentGuid: string;
  grandparentKey: string;
  grandparentRatingKey: string;
  grandparentSlug: string;
  grandparentTheme: string;
  grandparentThumb: string;
  grandparentTitle: string;
  guid: string;
  index: number;
  key: string;
  lastViewedAt: number;
  librarySectionID: string;
  librarySectionKey: string;
  librarySectionTitle: string;
  originallyAvailableAt: string;
  parentGuid: string;
  parentIndex: number;
  parentKey: string;
  parentRatingKey: string;
  parentThumb: string;
  parentTitle: string;
  ratingKey: string;
  sessionKey: string;
  summary: string;
  thumb: string;
  title: string;
  titleSort: string;
  type: string;
  updatedAt: number;
  viewOffset: number;
  year: number;
  Media: MediaItem[];
  UltraBlurColors: UltraBlurColorsItem[];
  Rating: RatingItem[];
  Director: DirectorItem[];
  Writer: WriterItem[];
  Role: RoleItem[];
  Producer: ProducerItem[];
  User: User;
  Player: Player;
  Session: Session;
  TranscodeSession: TranscodeSession;
}

interface MediaItem {
  hasVoiceActivity: string;
  id: string;
  videoProfile: string;
  audioChannels: number;
  audioCodec: string;
  bitrate: number;
  container: string;
  duration: number;
  height: number;
  protocol: string;
  videoCodec: string;
  videoFrameRate: string;
  videoResolution: string;
  width: number;
  selected: boolean;
  Part: PartItem[];
}

interface PartItem {
  id: string;
  indexes: string;
  videoProfile: string;
  bitrate: number;
  container: string;
  duration: number;
  height: number;
  protocol: string;
  width: number;
  decision: string;
  selected: boolean;
  Stream: StreamItem[];
}

interface StreamItem {
  bitDepth?: number;
  bitrate: number;
  codec: string;
  colorTrc?: string;
  default: boolean;
  displayTitle: string;
  extendedDisplayTitle: string;
  frameRate?: number;
  height?: number;
  id: string;
  streamType: number;
  width?: number;
  decision: string;
  location: string;
  bitrateMode?: string;
  channels?: number;
  language?: string;
  languageCode?: string;
  languageTag?: string;
  selected?: boolean;
}

interface UltraBlurColorsItem {
  bottomLeft: string;
  bottomRight: string;
  topLeft: string;
  topRight: string;
}

interface RatingItem {
  image: string;
  type: string;
  value: string;
}

interface DirectorItem {
  filter: string;
  id: string;
  tag: string;
  tagKey: string;
  thumb: string;
}

interface WriterItem {
  filter: string;
  id: string;
  tag: string;
  tagKey: string;
}

interface RoleItem {
  filter: string;
  id: string;
  role: string;
  tag: string;
  tagKey: string;
  thumb?: string;
}

interface ProducerItem {
  filter: string;
  id: string;
  tag: string;
  tagKey: string;
}

interface User {
  id: string;
  thumb: string;
  title: string;
}

interface Player {
  address: string;
  device: string;
  machineIdentifier: string;
  model: string;
  platform: string;
  platformVersion: string;
  product: string;
  profile: string;
  remotePublicAddress: string;
  state: string;
  title: string;
  vendor: string;
  version: string;
  local: boolean;
  relayed: boolean;
  secure: boolean;
  userID: number;
}

interface Session {
  id: string;
  bandwidth: number;
  location: string;
}

interface TranscodeSession {
  key: string;
  throttled: boolean;
  complete: boolean;
  progress: number;
  size: number;
  speed: number;
  error: boolean;
  duration: number;
  context: string;
  sourceVideoCodec: string;
  sourceAudioCodec: string;
  videoDecision: string;
  audioDecision: string;
  protocol: string;
  container: string;
  videoCodec: string;
  audioCodec: string;
  audioChannels: number;
  transcodeHwRequested: boolean;
  timeStamp: number;
  maxOffsetAvailable: number;
  minOffsetAvailable: number;
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const PLEX_ACCESS_TOKEN =
    process.env[`WIDGET_${id.toUpperCase()}_PLEX_ACCESS_TOKEN`];
  if (!PLEX_ACCESS_TOKEN) {
    return Response.json(
      { error: "Plex access token not found" },
      { status: 404 }
    );
  }

  const service = await getService(id, "plex");
  if (!service) {
    return Response.json({ error: "Service not found" }, { status: 404 });
  }

  if (!service.url) {
    return Response.json({ error: "Service URL not found" }, { status: 404 });
  }

  // The service URL may include a base path, so we need to merge the base path
  // with the API endpoint.
  const url = new URL(service.url);
  url.pathname = path.join(url.pathname, "/status/sessions");

  const response = await fetch(url, {
    headers: {
      "X-Plex-Token": PLEX_ACCESS_TOKEN,
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    return Response.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }

  return Response.json(await response.json());
}
