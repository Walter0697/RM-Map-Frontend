import React from 'react'

import FavoriteIcon from '@mui/icons-material/Favorite'
import AcUnitIcon from '@mui/icons-material/AcUnit'
import CakeIcon from '@mui/icons-material/Cake'
import EventIcon from '@mui/icons-material/Event'
import AppleIcon from '@mui/icons-material/Apple'
import BedtimeIcon from '@mui/icons-material/Bedtime'
import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon'
import EmojiNatureIcon from '@mui/icons-material/EmojiNature'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import IcecreamIcon from '@mui/icons-material/Icecream'
import LocalDiningIcon from '@mui/icons-material/LocalDining'
import MuseumIcon from '@mui/icons-material/Museum'
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset'
import FestivalIcon from '@mui/icons-material/Festival'

function VersionIcon({
    icon,
    sx,
}) {
    switch (icon) {
        case 'valentine':
            return (<FavoriteIcon sx={sx} />)
        case 'christmas':
            return (<AcUnitIcon sx={sx} />)
        case 'anniversary':
            return (<EventIcon sx={sx} />)
        case 'birthday':
            return (<CakeIcon sx={sx} />)
        case 'apple':
            return (<AppleIcon sx={sx} />)
        case 'moon':
            return (<BedtimeIcon sx={sx} />)
        case 'pokemon':
            return (<CatchingPokemonIcon sx={sx} />)
        case 'nature':
            return (<EmojiNatureIcon sx={sx} />)
        case 'champion':
            return (<EmojiEventsIcon sx={sx} />)
        case 'icecream':
            return (<IcecreamIcon sx={sx} />)
        case 'dining':
            return (<LocalDiningIcon sx={sx} />)
        case 'museum':
            return (<MuseumIcon sx={sx} />)
        case 'game':
            return (<VideogameAssetIcon sx={sx} />)
        case 'festival':
            return (<FestivalIcon sx={sx} />)
        default:
            return false
    }
}

export default VersionIcon