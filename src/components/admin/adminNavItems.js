const adminNavItems = [
    {
        label: 'Type',
        description: 'Marker type icons and priority',
        path: '/admin/type',
    },
    {
        label: 'Pin',
        description: 'Pin labels, images, and bounds',
        path: '/admin/pin',
    },
    {
        label: 'Default Pin',
        description: 'Fallback pin assignments',
        path: '/admin/defaultpin',
    },
    {
        label: 'API Key',
        description: 'Automation client credentials',
        path: '/admin/apikey',
    },
    {
        label: 'Train Station',
        description: 'Map image, pins, lines, and JSON export',
        path: '/admin/station',
    },
    {
        label: 'Permanent Cleanup',
        description: 'Search, delete, and schedule marker/schedule cleanup',
        path: '/admin/cleanup',
    },
    {
        label: 'API Usage',
        description: 'External provider usage and trends',
        path: '/admin/api-usage',
    },
    {
        label: 'System Settings',
        description: 'Runtime integration configuration',
        path: '/admin/system-settings',
    },
]

export default adminNavItems
