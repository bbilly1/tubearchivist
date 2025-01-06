import { useNavigate } from 'react-router-dom';
import { ColourVariants } from '../api/actions/updateUserConfig';
import { ColourConstant } from '../configuration/colours/getColours';
import SettingsNavigation from '../components/SettingsNavigation';
import Notifications from '../components/Notifications';
import Button from '../components/Button';
import loadIsAdmin from '../functions/getIsAdmin';
import { useUserConfigStore } from '../stores/UserConfigStore';
import { useEffect, useState } from 'react';

const SettingsUser = () => {
  const { userConfig, setPartialConfig } = useUserConfigStore();
  const isAdmin = loadIsAdmin();
  const navigate = useNavigate();

  const [styleSheet, setStyleSheet] = useState<ColourVariants>(userConfig.config.stylesheet);
  const [styleSheetRefresh, setStyleSheetRefresh] = useState(false);
  const [pageSize, setPageSize] = useState<number>(userConfig.config.page_size);

  useEffect(() => {
    (async () => {
      setStyleSheet(userConfig.config.stylesheet);
      setPageSize(userConfig.config.page_size);
    })();
  }, [userConfig.config.page_size, userConfig.config.stylesheet]);

  const handleStyleSheetChange = async (selectedStyleSheet: ColourVariants) => {
    setPartialConfig({stylesheet: selectedStyleSheet});
    setStyleSheet(selectedStyleSheet);
    setStyleSheetRefresh(true);
  }

  const handlePageSizeChange = async () => {
    setPartialConfig({page_size: pageSize});
  }

  const handlePageRefresh = () => {
    navigate(0);
    setStyleSheetRefresh(false);
  }

  return (
    <>
      <title>TA | User Settings</title>
      <div className="boxed-content">
        <SettingsNavigation />
        <Notifications pageName={'all'} />

        <div className="title-bar">
          <h1>User Configurations</h1>
        </div>
        <div className='info-box'>
          <div className='info-box-item'>
            <h2>Customize user Interface</h2>
            <div className='settings-box-wrapper'>
              <div>
                <p>Switch your color scheme</p>
              </div>
              <div>
                <select
                  name="stylesheet"
                  id="id_stylesheet"
                  value={styleSheet}
                  onChange={event => {
                    handleStyleSheetChange(event.target.value as ColourVariants);
                  }}
                >
                  {Object.entries(ColourConstant).map(([key, value]) => {
                    return (
                      <option key={key} value={value}>
                        {key}
                      </option>
                    );
                  })}
                </select>
                {styleSheetRefresh && (
                  <button onClick={handlePageRefresh}>Refresh</button>
                )}
              </div>
            </div>
            <div className='settings-box-wrapper'>
              <div>
                <p>Archive view page size</p>
              </div>
              <div>
                <input
                  type="number"
                  name="page_size"
                  id="id_page_size"
                  value={pageSize || 12}
                  onChange={event => {
                    setPageSize(Number(event.target.value));
                  }}
                />
                <div className='button-box'>
                  {userConfig.config.page_size !== pageSize && (
                    <>
                      <button onClick={handlePageSizeChange}>Update</button>
                      <button onClick={() => setPageSize(userConfig.config.page_size)}>Cancel</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {isAdmin && (
          <>
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
