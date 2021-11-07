import React from 'react'
import BottomUpTrail from '../animatein/BottomUpTrail'

import MarkerRelation from './settings/MarkerRelation'
import PreferredPin from './settings/PreferredPin'

function ButtonBox({
  height,
  children,
}) {
  return (
    <div style={{
      height,
      marginBottom: '10px',
    }}>
      {children}
    </div>
  )
}

function SettingList({
  relationUser,
  openRelationChange,
  pinPreference,
  openPreferredPinForm,
}) {
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
        <ButtonBox
          height={90}
        >
          <MarkerRelation
            relationUser={relationUser}
            openRelationChange={openRelationChange}
          />
        </ButtonBox>
        <ButtonBox
          height={400}
        >
          <PreferredPin
            preferredPinList={pinPreference}
            openPreferredPinChange={openPreferredPinForm}
          />
        </ButtonBox>
      </BottomUpTrail>
    </div>
  )
}

export default SettingList