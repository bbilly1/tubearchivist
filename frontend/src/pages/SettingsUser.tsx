import { useLoaderData, useNavigate, useOutletContext } from 'react-router-dom';
import updateUserConfig, { UserConfigType, UserMeType } from '../api/actions/updateUserConfig';
import { useEffect, useState } from 'react';
import loadUserMeConfig from '../api/loader/loadUserConfig';
import { ColourConstant, ColourVariants } from '../configuration/colours/getColours';
import SettingsNavigation from '../components/SettingsNavigation';
import Notifications from '../components/Notifications';
import { Helmet } from 'react-helmet';
import Button from '../components/Button';
import { OutletContextType } from './Base';

type SettingsUserLoaderData = {
  userConfig: UserMeType;
};

const SettingsUser = () => {
  const { isAdmin } = useOutletContext() as OutletContextType;
  const { userConfig } = useLoaderData() as SettingsUserLoaderData;
  const navigate = useNavigate();

  const userMeConfig = userConfig.config;
  const { stylesheet, page_size } = userMeConfig;

  const [selectedStylesheet, setSelectedStylesheet] = useState(userMeConfig.stylesheet);
  const [selectedPageSize, setSelectedPageSize] = useState(userMeConfig.page_size);
  const [refresh, setRefresh] = useState(false);

  const [userConfigResponse, setUserConfigResponse] = useState<UserConfigType>();

  const stylesheetOverwritable =
    userConfigResponse?.stylesheet || stylesheet || (ColourConstant.Dark as ColourVariants);
  const pageSizeOverwritable = userConfigResponse?.page_size || page_size || 12;

  useEffect(() => {
    (async () => {
      if (refresh) {
        const userConfigResponse = await loadUserMeConfig();

        setUserConfigResponse(userConfigResponse.config);
        setRefresh(false);
        navigate(0);
      }
    })();
  }, [navigate, refresh]);

  return (
    <>
      <Helmet>
        <title>TA | User Settings</title>
      </Helmet>
      <div className="boxed-content">
        <SettingsNavigation />
        <Notifications pageName={'all'} />

        <div className="title-bar">
          <h1>User Configurations</h1>
        </div>
        <div>
          <div className="settings-group">
            <h2>Stylesheet</h2>
            <div className="settings-item">
              <p>
                Current stylesheet:{' '}
                <span className="settings-current">{stylesheetOverwritable}</span>
              </p>
              <i>Select your preferred stylesheet.</i>
              <br />
              <select
                name="stylesheet"
                id="id_stylesheet"
                value={selectedStylesheet}
                onChange={event => {
                  setSelectedStylesheet(event.target.value as ColourVariants);
                }}
              >
                <option value="">-- change stylesheet --</option>
                {Object.entries(ColourConstant).map(([key, value]) => {
                  return (
                    <option key={key} value={value}>
                      {key}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <div className="settings-group">
            <h2>Archive View</h2>
            <div className="settings-item">
              <p>
                Current page size: <span className="settings-current">{pageSizeOverwritable}</span>
              </p>
              <i>Result of videos showing in archive page</i>
              <br />

              <input
                type="number"
                name="page_size"
                id="id_page_size"
                value={selectedPageSize}
                onChange={event => {
                  setSelectedPageSize(Number(event.target.value));
                }}
              ></input>
            </div>
          </div>
          <Button
            name="user-settings"
            label="Update User Configurations"
            onClick={async () => {
              await updateUserConfig({
                page_size: selectedPageSize,
                stylesheet: selectedStylesheet,
              });

              setRefresh(true);
            }}
          />
        </div>

        {isAdmin && (
          <>
            <div className="title-bar">
              <h1>Users</h1>
            </div>
            <div className="settings-group">
              <h2>User Management</h2>
              <p>
                Access the admin interface for basic user management functionality like adding and
                deleting users, changing passwords and more.
              </p>
              <a href="/admin/">
                <Button label="Admin Interface" />
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SettingsUser;
