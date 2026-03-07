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

const legacyIconComponentMap = {
    valentine: FavoriteIcon,
    christmas: AcUnitIcon,
    anniversary: EventIcon,
    birthday: CakeIcon,
    apple: AppleIcon,
    moon: BedtimeIcon,
    pokemon: CatchingPokemonIcon,
    nature: EmojiNatureIcon,
    champion: EmojiEventsIcon,
    icecream: IcecreamIcon,
    dining: LocalDiningIcon,
    museum: MuseumIcon,
    game: VideogameAssetIcon,
    festival: FestivalIcon,
}

const emojiIconOptions = [
    ['sun', 'Sun', '☀️'],
    ['cloud', 'Cloud', '☁️'],
    ['rain', 'Rain', '🌧️'],
    ['storm', 'Storm', '⛈️'],
    ['snow', 'Snow', '❄️'],
    ['wind', 'Wind', '🌬️'],
    ['fire', 'Fire', '🔥'],
    ['water', 'Water', '💧'],
    ['leaf', 'Leaf', '🍃'],
    ['flower', 'Flower', '🌸'],
    ['rose', 'Rose', '🌹'],
    ['tree', 'Tree', '🌳'],
    ['palm', 'Palm', '🌴'],
    ['cactus', 'Cactus', '🌵'],
    ['mountain', 'Mountain', '⛰️'],
    ['volcano', 'Volcano', '🌋'],
    ['beach', 'Beach', '🏖️'],
    ['island', 'Island', '🏝️'],
    ['earth', 'Earth', '🌍'],
    ['star', 'Star', '⭐'],
    ['sparkles', 'Sparkles', '✨'],
    ['comet', 'Comet', '☄️'],
    ['moon-face', 'Moon Face', '🌝'],
    ['rocket', 'Rocket', '🚀'],
    ['satellite', 'Satellite', '🛰️'],
    ['planet-ring', 'Planet Ring', '🪐'],
    ['heart-red', 'Red Heart', '❤️'],
    ['heart-blue', 'Blue Heart', '💙'],
    ['heart-green', 'Green Heart', '💚'],
    ['heart-yellow', 'Yellow Heart', '💛'],
    ['heart-purple', 'Purple Heart', '💜'],
    ['heart-black', 'Black Heart', '🖤'],
    ['gift', 'Gift', '🎁'],
    ['party', 'Party', '🎉'],
    ['confetti', 'Confetti', '🎊'],
    ['balloon', 'Balloon', '🎈'],
    ['trophy', 'Trophy', '🏆'],
    ['medal', 'Medal', '🥇'],
    ['crown', 'Crown', '👑'],
    ['gem', 'Gem', '💎'],
    ['music', 'Music', '🎵'],
    ['microphone', 'Microphone', '🎤'],
    ['headphones', 'Headphones', '🎧'],
    ['guitar', 'Guitar', '🎸'],
    ['piano', 'Piano', '🎹'],
    ['drum', 'Drum', '🥁'],
    ['movie', 'Movie', '🎬'],
    ['camera', 'Camera', '📷'],
    ['video', 'Video', '📹'],
    ['book', 'Book', '📚'],
    ['notebook', 'Notebook', '📓'],
    ['memo', 'Memo', '📝'],
    ['newspaper', 'Newspaper', '📰'],
    ['bulb', 'Bulb', '💡'],
    ['magnet', 'Magnet', '🧲'],
    ['gear', 'Gear', '⚙️'],
    ['wrench', 'Wrench', '🔧'],
    ['hammer', 'Hammer', '🔨'],
    ['shield', 'Shield', '🛡️'],
    ['lock', 'Lock', '🔒'],
    ['key', 'Key', '🔑'],
    ['bell', 'Bell', '🔔'],
    ['hourglass', 'Hourglass', '⌛'],
    ['alarm', 'Alarm', '⏰'],
    ['calendar', 'Calendar', '📅'],
    ['clock', 'Clock', '🕒'],
    ['map', 'Map', '🗺️'],
    ['pin', 'Pin', '📌'],
    ['compass', 'Compass', '🧭'],
    ['train', 'Train', '🚆'],
    ['tram', 'Tram', '🚊'],
    ['bus', 'Bus', '🚌'],
    ['car', 'Car', '🚗'],
    ['taxi', 'Taxi', '🚕'],
    ['bike', 'Bike', '🚲'],
    ['plane', 'Plane', '✈️'],
    ['ship', 'Ship', '🚢'],
    ['subway', 'Subway', '🚇'],
    ['house', 'House', '🏠'],
    ['city', 'City', '🏙️'],
    ['office', 'Office', '🏢'],
    ['school', 'School', '🏫'],
    ['hospital', 'Hospital', '🏥'],
    ['store', 'Store', '🏪'],
    ['restaurant', 'Restaurant', '🍽️'],
    ['coffee', 'Coffee', '☕'],
    ['tea', 'Tea', '🍵'],
    ['pizza', 'Pizza', '🍕'],
    ['burger', 'Burger', '🍔'],
    ['ramen', 'Ramen', '🍜'],
    ['cake-slice', 'Cake Slice', '🍰'],
    ['cookie', 'Cookie', '🍪'],
    ['ice', 'Ice', '🧊'],
    ['apple-red', 'Apple Red', '🍎'],
    ['banana', 'Banana', '🍌'],
    ['grape', 'Grape', '🍇'],
    ['cherry', 'Cherry', '🍒'],
    ['peach', 'Peach', '🍑'],
    ['lemon', 'Lemon', '🍋'],
    ['soccer', 'Soccer', '⚽'],
    ['basketball', 'Basketball', '🏀'],
    ['baseball', 'Baseball', '⚾'],
    ['tennis', 'Tennis', '🎾'],
    ['bowling', 'Bowling', '🎳'],
    ['chess', 'Chess', '♟️'],
    ['controller', 'Controller', '🎮'],
    ['dice', 'Dice', '🎲'],
    ['puzzle', 'Puzzle', '🧩'],
    ['robot', 'Robot', '🤖'],
    ['ghost', 'Ghost', '👻'],
    ['alien', 'Alien', '👽'],
    ['cat', 'Cat', '🐱'],
    ['dog', 'Dog', '🐶'],
    ['fox', 'Fox', '🦊'],
    ['bear', 'Bear', '🐻'],
    ['panda', 'Panda', '🐼'],
    ['rabbit', 'Rabbit', '🐰'],
    ['koala', 'Koala', '🐨'],
    ['penguin', 'Penguin', '🐧'],
    ['whale', 'Whale', '🐳'],
    ['fish', 'Fish', '🐟'],
    ['octopus', 'Octopus', '🐙'],
    ['butterfly', 'Butterfly', '🦋'],
    ['bee', 'Bee', '🐝'],
    ['ladybug', 'Ladybug', '🐞'],
]

export const RELEASE_NOTE_ICON_OPTIONS = [
    { key: '', label: 'No icon', kind: 'none' },
    ...Object.keys(legacyIconComponentMap).map((key) => ({
        key,
        label: key,
        kind: 'mui',
    })),
    ...emojiIconOptions.map(([key, label, emoji]) => ({
        key,
        label,
        emoji,
        kind: 'emoji',
    })),
]

function VersionIcon({
    icon,
    sx,
}) {
    const key = `${icon || ''}`.trim()
    if (!key) return false

    const MUIIcon = legacyIconComponentMap[key]
    if (MUIIcon) {
        return (<MUIIcon sx={sx} />)
    }

    const emojiOption = RELEASE_NOTE_ICON_OPTIONS.find((item) => item.key === key && item.kind === 'emoji')
    if (emojiOption?.emoji) {
        return (
            <span style={{ fontSize: (sx && sx.fontSize) || 18, lineHeight: 1 }}>
                {emojiOption.emoji}
            </span>
        )
    }

    return false
}

export default VersionIcon
