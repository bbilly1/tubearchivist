import { useEffect, useState } from 'react';
import {
  Link,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { UserMeType } from '../api/actions/updateUserConfig';
import loadPlaylistById from '../api/loader/loadPlaylistById';
import { OutletContextType } from './Base';
import { ConfigType, VideoType, ViewLayoutType } from './Home';
import Filterbar from '../components/Filterbar';
import { PlaylistEntryType } from './Playlists';
import loadChannelById from '../api/loader/loadChannelById';
import VideoList from '../components/VideoList';
import Pagination, { PaginationType } from '../components/Pagination';
import ChannelOverview from '../components/ChannelOverview';
import Linkify from '../components/Linkify';
import { ViewStyleNames, ViewStyles } from '../configuration/constants/ViewStyle';
import updatePlaylistSubscription from '../api/actions/updatePlaylistSubscription';
import deletePlaylist from '../api/actions/deletePlaylist';
import Routes from '../configuration/routes/RouteList';
import { ChannelResponseType } from './ChannelBase';
import formatDate from '../functions/formatDates';
import queueReindex from '../api/actions/queueReindex';
import updateWatchedState from '../api/actions/updateWatchedState';
import ScrollToTopOnNavigate from '../components/ScrollToTop';
import EmbeddableVideoPlayer from '../components/EmbeddableVideoPlayer';
import { Helmet } from 'react-helmet';
import Button from '../components/Button';
import loadVideoListByFilter from '../api/loader/loadVideoListByPage';

export type PlaylistType = {
  playlist_active: boolean;
  playlist_channel: string;
  playlist_channel_id: string;
  playlist_description: string;
  playlist_entries: PlaylistEntryType[];
  playlist_id: string;
  playlist_last_refresh: string;
  playlist_name: string;
  playlist_subscribed: boolean;
  playlist_thumbnail: string;
  playlist_type: string;
  _index: string;
  _score: number;
};

type PlaylistLoaderDataType = {
  userConfig: UserMeType;
};

export type PlaylistResponseType = {
  data?: PlaylistType;
  config?: ConfigType;
};

export type VideoResponseType = {
  data?: VideoType[];
  config?: ConfigType;
  paginate?: PaginationType;
};

const Playlist = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get('videoId');

  const { userConfig } = useLoaderData() as PlaylistLoaderDataType;
  const { isAdmin, currentPage, setCurrentPage } = useOutletContext() as OutletContextType;

  const userMeConfig = userConfig.config;

  const [hideWatched, setHideWatched] = useState(userMeConfig.hide_watched || false);
  const [view, setView] = useState<ViewLayoutType>(userMeConfig.view_style_home || 'grid');
  const [gridItems, setGridItems] = useState(userMeConfig.grid_items || 3);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reindex, setReindex] = useState(false);

  const [playlistResponse, setPlaylistResponse] = useState<PlaylistResponseType>();
  const [channelResponse, setChannelResponse] = useState<ChannelResponseType>();
  const [videoResponse, setVideoResponse] = useState<VideoResponseType>();

  const playlist = playlistResponse?.data;
  const channel = channelResponse?.data;
  const videos = videoResponse?.data;
  const pagination = videoResponse?.paginate;

  const palylistEntries = playlistResponse?.data?.playlist_entries;
  const videoArchivedCount = Number(palylistEntries?.filter(video => video.downloaded).length);
  const videoInPlaylistCount = pagination?.total_hits;
  const showEmbeddedVideo = videoId !== null;

  const isGridView = view === ViewStyles.grid;
  const gridView = isGridView ? `boxed-${gridItems}` : '';
  const gridViewGrid = isGridView ? `grid-${gridItems}` : '';

  useEffect(() => {
    (async () => {
      if (
        refresh ||
        pagination?.current_page === undefined ||
        currentPage !== pagination?.current_page
      ) {
        const playlist = await loadPlaylistById(playlistId);
        const video = await loadVideoListByFilter({
          playlist: playlistId,
          page: currentPage,
          watch: hideWatched ? 'unwatched' : undefined,
          sort: 'downloaded', // downloaded or published? or playlist sort order?
        });

        const isCustomPlaylist = playlist?.data?.playlist_type === 'custom';
        if (!isCustomPlaylist) {
          const channel = await loadChannelById(playlist.data.playlist_channel_id);

          setChannelResponse(channel);
        }

        setPlaylistResponse(playlist);
        setVideoResponse(video);
        setRefresh(false);
      }
    })();
    // Do not add hideWatched this will not work as expected!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistId, refresh, currentPage, pagination?.current_page]);

  if (!playlistId || !playlist) {
    return `Playlist ${playlistId} not found!`;
  }

  const isCustomPlaylist = playlist.playlist_type === 'custom';

  return (
    <>
      <Helmet>
        <title>TA | Playlist: {playlist.playlist_name}</title>
      </Helmet>
      <ScrollToTopOnNavigate />
      <div className="boxed-content">
        <div className="title-bar">
          <h1>{playlist.playlist_name}</h1>
        </div>
        <div className="info-box info-box-3">
          {!isCustomPlaylist && channel && (
            <ChannelOverview
              channelId={channel?.channel_id}
              channelname={channel?.channel_name}
              channelSubs={channel?.channel_subs}
              channelSubscribed={channel?.channel_subscribed}
              setRefresh={setRefresh}
            />
          )}

          <div className="info-box-item">
            <div>
              <p>Last refreshed: {formatDate(playlist.playlist_last_refresh)}</p>
              {!isCustomPlaylist && (
                <>
                  <p>
                    Playlist:
                    {playlist.playlist_subscribed && (
                      <>
                        {isAdmin && (
                          <Button
                            label="Unsubscribe"
                            className="unsubscribe"
                            type="button"
                            title={`Unsubscribe from ${playlist.playlist_name}`}
                            onClick={async () => {
                              await updatePlaylistSubscription(playlistId, false);

                              setRefresh(true);
                            }}
                          />
                        )}
                      </>
                    )}{' '}
                    {!playlist.playlist_subscribed && (
                      <Button
                        label="Subscribe"
                        type="button"
                        title={`Subscribe to ${playlist.playlist_name}`}
                        onClick={async () => {
                          await updatePlaylistSubscription(playlistId, true);

                          setRefresh(true);
                        }}
                      />
                    )}
                  </p>
                  {playlist.playlist_active && (
                    <p>
                      Youtube:{' '}
                      <a
                        href={`https://www.youtube.com/playlist?list=${playlist.playlist_id}`}
                        target="_blank"
                      >
                        Active
                      </a>
                    </p>
                  )}
                  {!playlist.playlist_active && <p>Youtube: Deactivated</p>}
                </>
              )}

              {!showDeleteConfirm && (
                <Button
                  label="Delete Playlist"
                  id="delete-item"
                  onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                />
              )}

              {showDeleteConfirm && (
                <div className="delete-confirm" id="delete-button">
                  <span>Delete {playlist.playlist_name}?</span>

                  <Button
                    label="Delete metadata"
                    onClick={async () => {
                      await deletePlaylist(playlistId, false);
                      navigate(Routes.Playlists);
                    }}
                  />

                  <Button
                    label="Delete all"
                    className="danger-button"
                    onClick={async () => {
                      await deletePlaylist(playlistId, true);
                      navigate(Routes.Playlists);
                    }}
                  />

                  <br />
                  <Button label="Cancel" onClick={() => setShowDeleteConfirm(!showDeleteConfirm)} />
                </div>
              )}
            </div>
          </div>
          <div className="info-box-item">
            <div>
              {videoArchivedCount > 0 && (
                <>
                  <p>
                    Total Videos archived: {videoArchivedCount}/{videoInPlaylistCount}
                  </p>
                  <div id="watched-button" className="button-box">
                    <Button
                      label="Mark as watched"
                      title={`Mark all videos from ${playlist.playlist_name} as watched`}
                      type="button"
                      onClick={async () => {
                        await updateWatchedState({
                          id: playlistId,
                          is_watched: true,
                        });

                        setRefresh(true);
                      }}
                    />{' '}
                    <Button
                      label="Mark as unwatched"
                      title={`Mark all videos from ${playlist.playlist_name} as unwatched`}
                      type="button"
                      onClick={async () => {
                        await updateWatchedState({
                          id: playlistId,
                          is_watched: false,
                        });

                        setRefresh(true);
                      }}
                    />
                  </div>
                </>
              )}

              {reindex && <p>Reindex scheduled</p>}
              {!reindex && (
                <div id="reindex-button" className="button-box">
                  {!isCustomPlaylist && (
                    <Button
                      label="Reindex"
                      title={`Reindex Playlist ${playlist.playlist_name}`}
                      onClick={async () => {
                        setReindex(true);

                        await queueReindex(playlist.playlist_id, 'playlist');
                      }}
                    />
                  )}{' '}
                  <Button
                    label="Reindex Videos"
                    title={`Reindex Videos of ${playlist.playlist_name}`}
                    onClick={async () => {
                      setReindex(true);

                      await queueReindex(playlist.playlist_id, 'playlist', true);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {playlist.playlist_description && (
          <div className="description-box">
            <p
              id={descriptionExpanded ? 'text-expand-expanded' : 'text-expand'}
              className="description-text"
            >
              <Linkify>{playlist.playlist_description}</Linkify>
            </p>

            <Button
              label="Show more"
              id="text-expand-button"
              onClick={() => setDescriptionExpanded(!descriptionExpanded)}
            />
          </div>
        )}
      </div>

      <div className={`boxed-content ${gridView}`}>
        <Filterbar
          hideToggleText="Hide watched videos:"
          hideWatched={hideWatched}
          isGridView={isGridView}
          view={view}
          gridItems={gridItems}
          userMeConfig={userMeConfig}
          setHideWatched={setHideWatched}
          setView={setView}
          setGridItems={setGridItems}
          viewStyleName={ViewStyleNames.playlist}
          setRefresh={setRefresh}
        />
      </div>

      {showEmbeddedVideo && <EmbeddableVideoPlayer videoId={videoId} />}

      <div className={`boxed-content ${gridView}`}>
        <div className={`video-list ${view} ${gridViewGrid}`}>
          {videoInPlaylistCount === 0 && (
            <>
              <h2>No videos found...</h2>
              {isCustomPlaylist && (
                <p>
                  Try going to the <a href="{% url 'home' %}">home page</a> to add videos to this
                  playlist.
                </p>
              )}

              {!isCustomPlaylist && (
                <p>
                  Try going to the <Link to={Routes.Downloads}>downloads page</Link> to start the
                  scan and download tasks.
                </p>
              )}
            </>
          )}
          {videoInPlaylistCount !== 0 && (
            <VideoList
              videoList={videos}
              viewLayout={view}
              playlistId={playlistId}
              showReorderButton={isCustomPlaylist}
              refreshVideoList={setRefresh}
            />
          )}
        </div>
      </div>

      <div className="boxed-content">
        {pagination && <Pagination pagination={pagination} setPage={setCurrentPage} />}
      </div>
    </>
  );
};

export default Playlist;
