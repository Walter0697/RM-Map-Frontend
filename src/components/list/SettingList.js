import React from 'react'
import BottomUpTrail from '../animatein/BottomUpTrail'

import MarkerRelation from './settings/MarkerRelation'
import PreferredPin from './settings/PreferredPin'
import LogoutButton from './settings/LogoutButton'
import VersionView from './settings/VersionView'
import WrapperBox from '../wrapper/WrapperBox'

import * as serviceWorkerRegistration from '../../serviceWorkerRegistration'

function SettingList({
  relationUser,
  openRelationChange,
  pinPreference,
  openPreferredPinForm,
}) {

  const checkUpdate = () => {
    serviceWorkerRegistration.unregister()
  }

  return (
    <div 
        style={{
            position: 'absolute',
            height: '80%',
            width: '95%',
            paddingLeft: '5%',
            paddingTop: '20px',
            overflow: 'auto',
        }}
    >
      <BottomUpTrail>
        <WrapperBox
          height={90}
          marginBottom={'15px'}
        >
          <MarkerRelation
            relationUser={relationUser}
            openRelationChange={openRelationChange}
          />
        </WrapperBox>
        <WrapperBox
          height={400}
          marginBottom={'15px'}
        >
          <PreferredPin
            preferredPinList={pinPreference}
            openPreferredPinChange={openPreferredPinForm}
          />
        </WrapperBox>
        <WrapperBox
          height={50}
          marginBottom={'15px'}
        >
          <LogoutButton
            setLoading={() => {}}
          />
        </WrapperBox>
        <WrapperBox
          height={30}
          marginBottom={'15px'}
        >
          <VersionView 
            onClickHandler={checkUpdate}
          />
        </WrapperBox>
      </BottomUpTrail>
    </div>
  )
}

export default SettingList