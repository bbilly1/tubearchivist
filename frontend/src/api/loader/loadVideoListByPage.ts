import defaultHeaders from '../../configuration/defaultHeaders';
import getApiUrl from '../../configuration/getApiUrl';
import getFetchCredentials from '../../configuration/getFetchCredentials';
import isDevEnvironment from '../../functions/isDevEnvironment';

type WatchTypes = 'watched' | 'unwatched' | 'continue';
type SortTypes = 'published' | 'downloaded' | 'views' | 'likes' | 'duration' | 'filesize';
type OrderTypes = 'asc' | 'desc';
type VideoTypes = 'videos' | 'streams' | 'shorts';

type FilterType = {
  page?: number;
  playlist?: string;
  channel?: string;
  watch?: WatchTypes;
  sort?: SortTypes;
  order?: OrderTypes;
  type?: VideoTypes;
};

const loadVideoListByPage = async (filter: FilterType) => {
  const apiUrl = getApiUrl();

  const searchParams = new URLSearchParams();

  if (filter.page) {
    searchParams.append('page', filter.page.toString());
  }

  if (filter.playlist) {
    searchParams.append('playlist', filter.playlist);
  } else if (filter.channel) {
    searchParams.append('channel', filter.channel);
  }

  if (filter.watch) {
    searchParams.append('watch', filter.watch);
  }

  if (filter.sort) {
    searchParams.append('sort', filter.sort);
  }

  if (filter.order) {
    searchParams.append('order', filter.order);
  }

  if (filter.type) {
    searchParams.append('type', filter.type);
  }

  const response = await fetch(`${apiUrl}/api/video/?${searchParams.toString()}`, {
    headers: defaultHeaders,
    credentials: getFetchCredentials(),
  });

  const videos = await response.json();

  if (isDevEnvironment()) {
    console.log('loadVideoListByPage', filter, videos);
  }

  return videos;
};

export default loadVideoListByPage;
