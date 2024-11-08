import { useEffect, useState } from 'react';
import { VideoResponseType } from '../pages/Video';
import VideoPlayer, { VideoProgressType } from './VideoPlayer';
import loadVideoById from '../api/loader/loadVideoById';
import loadVideoProgressById from '../api/loader/loadVideoProgressById';
import iconClose from '/img/icon-close.svg';
import iconEye from '/img/icon-eye.svg';
import iconThumb from '/img/icon-thumb.svg';
import WatchedCheckBox from './WatchedCheckBox';
import GoogleCast from './GoogleCast';
import updateWatchedState from '../api/actions/updateWatchedState';
import formatNumbers from '../functions/formatNumbers';
import { Link, useSearchParams } from 'react-router-dom';
import Routes from '../configuration/routes/RouteList';
import loadPlaylistById from '../api/loader/loadPlaylistById';

type Playlist = {
  id: string;
  name: string;
};
type PlaylistList = Playlist[];

type EmbeddableVideoPlayerProps = {
  videoId: string;
};

const EmbeddableVideoPlayer = ({ videoId }: EmbeddableVideoPlayerProps) => {
  const [, setSearchParams] = useSearchParams();

  const [refresh, setRefresh] = useState(false);

  const [videoResponse, setVideoResponse] = useState<VideoResponseType>();
  const [videoProgress, setVideoProgress] = useState<VideoProgressType>();
  const [playlists, setPlaylists] = useState<PlaylistList>();

  useEffect(() => {
    (async () => {
      const videoResponse = await loadVideoById(videoId);
      const videoProgress = await loadVideoProgressById(videoId);

      const playlistIds = videoResponse.data.playlist;
      if (playlistIds !== undefined) {
        const playlists = await Promise.all(
          playlistIds.map(async playlistid => {
            const playlistResponse = await loadPlaylistById(playlistid);

            return playlistResponse.data;
          }),
        );

        const playlistsFiltered = playlists
          .filter(playlist => {
            return playlist.playlist_subscribed;
          })
          .map(playlist => {
            return {
              id: playlist.playlist_id,
              name: playlist.playlist_name,
            };
          });

        setPlaylists(playlistsFiltered);
      }

      setVideoResponse(videoResponse);
      setVideoProgress(videoProgress);

      setRefresh(false);
    })();
  }, [videoId, refresh]);

  if (videoResponse === undefined) {
    return [];
  }

  const video = videoResponse.data;
  const name = video.title;
  const channelId = video.channel.channel_id;
  const channelName = video.channel.channel_name;
  const watched = video.player.watched;
  const sponsorblock = video.sponsorblock;
  const views = formatNumbers(video.stats.view_count);
  const hasLikes = video.stats.like_count;
  const likes = formatNumbers(video.stats.like_count);
  const hasDislikes = video.stats.dislike_count > 0 && videoResponse.config.downloads.integrate_ryd;
  const dislikes = formatNumbers(video.stats.dislike_count);
  const config = videoResponse.config;
  const cast = config.enable_cast;

  return (
    <>
      <div className="player-wrapper">
        <div className="video-player">
          <VideoPlayer
            video={videoResponse}
            videoProgress={videoProgress}
            sponsorBlock={sponsorblock}
            embed={true}
          />

          <div className="player-title boxed-content">
            <img
              className="close-button"
              src={iconClose}
              alt="close-icon"
              title="Close player"
              onClick={() => {
                setSearchParams({});
              }}
            />
            <WatchedCheckBox
              watched={watched}
              onClick={async status => {
                await updateWatchedState({
                  id: videoId,
                  is_watched: status,
                });

                setRefresh(true);
              }}
            />
            {cast && (
              <GoogleCast
                video={video}
                videoProgress={videoProgress}
                setRefresh={() => {
                  setRefresh(true);
                }}
              />
            )}

            <div className="thumb-icon player-stats">
              <img src={iconEye} alt="views icon" />
              <span>{views}</span>
              {hasLikes && (
                <>
                  <span>|</span>
                  <img src={iconThumb} alt="thumbs-up" />
                  <span>{likes}</span>
                </>
              )}
              {hasDislikes && (
                <>
                  <span>|</span>
                  <img className="dislike" src={iconThumb} alt="thumbs-down" />
                  <span>{dislikes}</span>
                </>
              )}
            </div>

            <div className="player-channel-playlist">
              <h3>
                <Link to={Routes.Channel(channelId)}>{channelName}</Link>
              </h3>

              {playlists?.map(({ id, name }) => {
                return (
                  <h5 key={id}>
                    <Link to={Routes.Playlist(id)}>{name}</Link>
                  </h5>
                );
              })}
            </div>

            <Link to={Routes.Video(videoId)}>
              <h2 id="video-title">{name}</h2>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmbeddableVideoPlayer;
