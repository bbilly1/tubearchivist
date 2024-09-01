import { Helmet } from 'react-helmet';
import Notifications from '../components/Notifications';
import SettingsNavigation from '../components/SettingsNavigation';
import Button from '../components/Button';
import PaginationDummy from '../components/PaginationDummy';
import { useEffect, useState } from 'react';
import loadSchedule, { ScheduleResponseType } from '../api/loader/loadSchedule';
import loadAppriseNotification from '../api/loader/loadAppriseNotification';
import deleteTaskSchedule from '../api/actions/deleteTaskSchedule';
import createTaskSchedule from '../api/actions/createTaskSchedule';


const SettingsScheduling = () => {
  const [refresh, setRefresh] = useState(false);

  const [scheduleResponse, setScheduleResponse] = useState<ScheduleResponseType>([]);
  const [appriseNotification, setAppriseNotification] = useState([]);

  const [updateSubscribed, setUpdateSubscribed] = useState('');
  const [downloadPending, setDownloadPending] = useState('');
  const [checkReindex, setCheckReindex] = useState('');
  const [checkReindexDays, setCheckReindexDays] = useState<number | undefined>(undefined);
  const [thumbnailCheck, setThumbnailCheck] = useState('');
  const [zipBackup, setZipBackup] = useState('');
  const [zipBackupDays, setZipBackupDays] = useState<number | undefined>(undefined);

  useEffect(() => {
    (async () => {
      if (refresh) {
        const scheduleResponse = await loadSchedule();
        const appriseNotificationResponse = await loadAppriseNotification();

        setScheduleResponse(scheduleResponse);
        setAppriseNotification(appriseNotificationResponse);

        setRefresh(false);
      }
    })();
  }, [refresh]);

  useEffect(() => {
    setRefresh(true);
  }, []);

  const groupedSchedules = Object.groupBy(scheduleResponse, ({ name }) => name);

  console.log(groupedSchedules);

  const { update_subscribed, download_pending, run_backup, check_reindex, thumbnail_check } =
    groupedSchedules;

  const updateSubscribedSchedule = update_subscribed?.pop();
  const downloadPendingSchedule = download_pending?.pop();
  const runBackup = run_backup?.pop();
  const checkReindexSchedule = check_reindex?.pop();
  const thumbnailCheckSchedule = thumbnail_check?.pop();

  return (
    <>
      <Helmet>
        <title>TA | Scheduling Settings</title>
      </Helmet>
      <div className="boxed-content">
        <SettingsNavigation />
        <Notifications pageName={'all'} />

        <div className="title-bar">
          <h1>Scheduler Setup</h1>
          <div className="settings-group">
            <p>
              Schedule settings expect a cron like format, where the first value is minute, second
              is hour and third is day of the week.
            </p>
            <p>Examples:</p>
            <ul>
              <li>
                <span className="settings-current">0 15 *</span>: Run task every day at 15:00 in the
                afternoon.
              </li>
              <li>
                <span className="settings-current">30 8 */2</span>: Run task every second day of the
                week (Sun, Tue, Thu, Sat) at 08:30 in the morning.
              </li>
              <li>
                <span className="settings-current">auto</span>: Sensible default.
              </li>
            </ul>
            <p>Note:</p>
            <ul>
              <li>
                Avoid an unnecessary frequent schedule to not get blocked by YouTube. For that
                reason, the scheduler doesn't support schedules that trigger more than once per
                hour.
              </li>
            </ul>
          </div>
        </div>

        <div className="settings-group">
          <h2>Rescan Subscriptions</h2>
          <div className="settings-item">
            <p>
              Become a sponsor and join{' '}
              <a href="https://members.tubearchivist.com/" target="_blank">
                members.tubearchivist.com
              </a>{' '}
              to get access to <span className="settings-current">real time</span> notifications for
              new videos uploaded by your favorite channels.
            </p>
            <p>
              Current rescan schedule:{' '}
              <span className="settings-current">
                {!updateSubscribedSchedule && 'False'}
                {updateSubscribedSchedule && (
                  <>
                    {updateSubscribedSchedule?.schedule}{' '}
                    <Button
                      label="Delete"
                      data-schedule="update_subscribed"
                      onClick={async () => {
                        await deleteTaskSchedule('update_subscribed');

                        setRefresh(true);
                      }}
                      className="danger-button"
                    />
                  </>
                )}
              </span>
            </p>
            <p>Periodically rescan your subscriptions:</p>

            <input
              type="text"
              value={updateSubscribed}
              onChange={e => {
                setUpdateSubscribed(e.currentTarget.value);
              }}
            />
            <Button
              label="Save"
              onClick={async () => {
                await createTaskSchedule('update_subscribed', {
                  schedule: updateSubscribed,
                });

                setUpdateSubscribed('');

                setRefresh(true);
              }}
            />
          </div>
        </div>
        <div className="settings-group">
          <h2>Start Download</h2>
          <div className="settings-item">
            <p>
              Current Download schedule:{' '}
              <span className="settings-current">
                {!download_pending && 'False'}
                {downloadPendingSchedule && (
                  <>
                    {downloadPendingSchedule.schedule}
                    <Button
                      label="Delete"
                      className="danger-button"
                      onClick={async () => {
                        await deleteTaskSchedule('download_pending');
                      }}
                    />
                  </>
                )}
              </span>
            </p>
            <p>Automatic video download schedule:</p>

            <input
              type="text"
              value={downloadPending}
              onChange={e => {
                setDownloadPending(e.currentTarget.value);
              }}
            />
            <Button
              label="Save"
              onClick={async () => {
                await createTaskSchedule('download_pending', {
                  schedule: downloadPending,
                });

                setDownloadPending('');

                setRefresh(true);
              }}
            />
          </div>
        </div>

        <div className="settings-group">
          <h2>Refresh Metadata</h2>
          <div className="settings-item">
            <p>
              Current Metadata refresh schedule:{' '}
              <span className="settings-current">
                {!checkReindexSchedule && 'False'}
                {checkReindexSchedule && (
                  <>
                    {checkReindexSchedule?.schedule}{' '}
                    <Button
                      label="Delete"
                      className="danger-button"
                      onClick={async () => {
                        await deleteTaskSchedule('check_reindex');

                        setRefresh(true);
                      }}
                    />
                  </>
                )}
              </span>
            </p>
            <p>Daily schedule to refresh metadata from YouTube:</p>

            <input
              type="text"
              value={checkReindex}
              onChange={e => {
                setCheckReindex(e.currentTarget.value);
              }}
            />
            <Button
              label="Save"
              onClick={async () => {
                await createTaskSchedule('check_reindex', {
                  schedule: checkReindex,
                });

                setCheckReindex('');

                setRefresh(true);
              }}
            />
          </div>
          <div className="settings-item">
            <p>
              Current refresh for metadata older than x days:{' '}
              <span className="settings-current">{checkReindexSchedule?.config?.days}</span>
            </p>
            <p>Refresh older than x days, recommended 90:</p>

            <input
              type="number"
              value={checkReindexDays}
              onChange={e => {
                setCheckReindexDays(Number(e.currentTarget.value));
              }}
            />
            <Button
              label="Save"
              onClick={async () => {
                await createTaskSchedule('check_reindex', {
                  config: {
                    days: checkReindexDays,
                  },
                });

                setCheckReindexDays(undefined);

                setRefresh(true);
              }}
            />
          </div>
        </div>

        <div className="settings-group">
          <h2>Thumbnail Check</h2>
          <div className="settings-item">
            <p>
              Current thumbnail check schedule:{' '}
              <span className="settings-current">
                {!thumbnailCheckSchedule && 'False'}
                {thumbnailCheckSchedule && (
                  <>
                    {thumbnailCheckSchedule?.schedule}{' '}
                    <Button
                      label="Delete"
                      className="danger-button"
                      onClick={async () => {
                        await deleteTaskSchedule('thumbnail_check');

                        setRefresh(true);
                      }}
                    />
                  </>
                )}
              </span>
            </p>
            <p>Periodically check and cleanup thumbnails:</p>

            <input
              type="text"
              value={thumbnailCheck}
              onChange={e => {
                setThumbnailCheck(e.currentTarget.value);
              }}
            />
            <Button
              label="Save"
              onClick={async () => {
                await createTaskSchedule('thumbnail_check', {
                  schedule: thumbnailCheck,
                });

                setThumbnailCheck('');

                setRefresh(true);
              }}
            />
          </div>
        </div>
        <div className="settings-group">
          <h2>ZIP file index backup</h2>
          <div className="settings-item">
            <p>
              <i>
                Zip file backups are very slow for large archives and consistency is not guaranteed,
                use snapshots instead. Make sure no other tasks are running when creating a Zip file
                backup.
              </i>
            </p>
            <p>
              Current index backup schedule:{' '}
              <span className="settings-current">
                {!runBackup && 'False'}
                {runBackup && (
                  <>
                    {runBackup.schedule}{' '}
                    <Button
                      label="Delete"
                      className="danger-button"
                      onClick={async () => {
                        await deleteTaskSchedule('run_backup');

                        setRefresh(true);
                      }}
                    />
                  </>
                )}
              </span>
            </p>
            <p>Automatically backup metadata to a zip file:</p>

            <input
              type="text"
              value={zipBackup}
              onChange={e => {
                setZipBackup(e.currentTarget.value);
              }}
            />
            <Button
              label="Save"
              onClick={async () => {
                await createTaskSchedule('run_backup', {
                  schedule: zipBackup,
                });

                setZipBackup('');

                setRefresh(true);
              }}
            />
          </div>
          <div className="settings-item">
            <p>
              Current backup files to keep:{' '}
              <span className="settings-current">{runBackup?.config?.rotate}</span>
            </p>
            <p>Max auto backups to keep:</p>

            <input
              type="number"
              value={zipBackupDays?.toString()}
              onChange={e => {
                setZipBackupDays(Number(e.currentTarget.value));
              }}
            />
            <Button
              label="Save"
              onClick={async () => {
                await createTaskSchedule('run_backup', {
                  config: {
                    rotate: zipBackupDays,
                  },
                });

                setZipBackupDays(undefined);

                setRefresh(true);
              }}
            />
          </div>
        </div>
        <div className="settings-group">
          <h2>Add Notification URL</h2>
          <div className="settings-item">
            {appriseNotification && (
              <>
                <p>
                  <Button
                    label="Show"
                    type="button"
                    onclick="textReveal(this)"
                    id="text-reveal-button"
                  />{' '}
                  stored notification links
                </p>
                <div id="text-reveal" className="description-text">
                  {appriseNotification?.items?.map(({ task, notification }) => {
                    return (
                      <>
                        <h3 key={task}>{notification.title}</h3>
                        {notification.urls.map((url: string) => {
                          return (
                            <p>
                              <Button
                                type="button"
                                className="danger-button"
                                label="Delete"
                                data-url={url}
                                data-task={task}
                                onclick="deleteNotificationUrl(this)"
                              />
                              <span> {url}</span>
                            </p>
                          );
                        })}
                      </>
                    );
                  })}
                </div>
              </>
            )}

            {!appriseNotification && <p>No notifications stored</p>}
          </div>
          <div className="settings-item">
            <p>
              <i>
                Send notification on completed tasks with the help of the{' '}
                <a href="https://github.com/caronc/apprise" target="_blank">
                  Apprise
                </a>{' '}
                library.
              </i>
            </p>
            <select name="task" id="id_task" defaultValue="">
              <option value="">-- select task --</option>
              <option value="update_subscribed">Rescan your Subscriptions</option>
              <option value="extract_download">Add to download queue</option>
              <option value="download_pending">Downloading</option>
              <option value="check_reindex">Reindex Documents</option>
            </select>

            <input
              type="text"
              name="notification_url"
              placeholder="Apprise notification URL"
              id="id_notification_url"
            />
          </div>
        </div>

        <Button type="submit" name="scheduler-settings" label="Update Scheduler Settings" />

        <PaginationDummy />
      </div>
    </>
  );
};

export default SettingsScheduling;
