import defaultHeaders from '../../configuration/defaultHeaders';
import getApiUrl from '../../configuration/getApiUrl';
import getFetchCredentials from '../../configuration/getFetchCredentials';
import isDevEnvironment from '../../functions/isDevEnvironment';

const loadVideoListByPage = async (page: number) => {
  const apiUrl = getApiUrl();

  const response = await fetch(`${apiUrl}/api/video/?page=${page}`, {
    headers: defaultHeaders,
    credentials: getFetchCredentials(),
  });

  const videos = await response.json();

  if (isDevEnvironment()) {
    console.log('loadVideoListByPage', videos);
  }

  return videos;
};

export default loadVideoListByPage;
