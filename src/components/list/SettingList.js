import React from 'react'
import { useHistory } from 'react-router-dom'
import BottomUpTrail from '../animatein/BottomUpTrail'

import MarkerRelation from './settings/MarkerRelation'
import PreferredPin from './settings/PreferredPin'
import LogoutButton from './settings/LogoutButton'
import VersionView from './settings/VersionView'
import ReleaseNoteButton from './settings/ReleaseNoteButton'

import PreviousMarkerButton from './settings/PreviousMarkerButton'
import ExpiredMarkerButton from './settings/ExpiredMarkerButton'
import WatchedMovieListButton from './settings/WatchedMovieListButton'
import PreviewDisplayPinButton from './settings/PreviewDisplayPinButton'

import WrapperBox from '../wrapper/WrapperBox'
import SectionHeader from './settings/SectionHeader'

import TagIcon from '@mui/icons-material/Tag'
import MapIcon from '@mui/icons-material/Map'
import TheatersIcon from '@mui/icons-material/Theaters'
import VisibilityIcon from '@mui/icons-material/Visibility'

import * as serviceWorkerRegistration from '../../serviceWorkerRegistration'

function SettingList({
  relationUser,
  openRelationChange,
  pinPreference,
  openPreferredPinForm,
  latestVersionRelease,
  seenRelease,
  openReleaseNote,
  previewPinLabel,
  openPreviewDisplayPinForm,
}) {
  const history = useHistory()

  const checkUpdate = () => {
    serviceWorkerRegistration.unregister()
  }

  const onPreviousMarkerClick = () => {
    history.replace('/previous')
  }

  const onExpiredMarkerClick = () => {
    history.replace('/expired')
  }

  const onWatchedMovieListClick = () => {
    history.replace('/watchedmovies')
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
          minHeight={320}
          height={'auto'}
          marginBottom={'30px'}
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
          <SectionHeader
            title={'App Version'}
            icon={<TagIcon />}
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
        <WrapperBox
          height={30}
          marginBottom={'30px'}
        >
          <ReleaseNoteButton 
            latestVersion={latestVersionRelease}
            seen={seenRelease}
            onClickHandler={openReleaseNote}
          />
        </WrapperBox>
        <WrapperBox
          height={50}
          marginBottom={'15px'}
        >
          <SectionHeader
            title={'Marker'}
            icon={<MapIcon />}
          />
        </WrapperBox>
        <WrapperBox
            height={30}
            marginBottom={'15px'}
        >
            <PreviousMarkerButton
                onClickHandler={onPreviousMarkerClick}
            />
        </WrapperBox>
        <WrapperBox
            height={30}
            marginBottom={'30px'}
        >
            <ExpiredMarkerButton
                onClickHandler={onExpiredMarkerClick}
            />
        </WrapperBox>
        <WrapperBox
          height={50}
          marginBottom={'15px'}
        >
          <SectionHeader
            title={'Preview'}
            icon={<VisibilityIcon />}
          />
        </WrapperBox>
        <WrapperBox
            height={30}
            marginBottom={'30px'}
        >
            <PreviewDisplayPinButton
                pinLabel={previewPinLabel}
                onClickHandler={openPreviewDisplayPinForm}
            />
        </WrapperBox>
        <WrapperBox
          height={50}
          marginBottom={'15px'}
        >
          <SectionHeader
            title={'Movies'}
            icon={<TheatersIcon />}
          />
        </WrapperBox>
        <WrapperBox
            height={30}
            marginBottom={'30px'}
        >
            <WatchedMovieListButton
                onClickHandler={onWatchedMovieListClick}
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
      </BottomUpTrail>
    </div>
  )
}

export default SettingList
