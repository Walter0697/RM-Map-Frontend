import JapanMap from '../images/country/japan.png'
import CanadaMap from '../images/country/canada.png'

import HKMTRImage from '../images/station/hkmtr2.jpeg'
import TORTCCImage from '../images/station/tortcc.png'

const countryList = [
    {
        label: 'Japan',
        image: JapanMap,
        dimension: {
            width: 2291,
            height: 2048,
        }
    },
    {
        label: 'Canada',
        image: CanadaMap,
        dimension: {
            width: 1667,
            height: 1080,
        }
    }
]

const stationList = [
    {
        identifier: 'HK_MTR',
        label: 'Hong Kong MTR',
        image: HKMTRImage,
        dimension: {
            width: 2000,
            height: 1322,
        }
    },
    {
        identifier: 'TOR_TCC',
        label: 'Toronto TCC',
        image: TORTCCImage,
        dimension: {
            width: 2560,
            height: 1707,
        }
    }
]

const country = {
    countryList,
    stationList,
}

export default country