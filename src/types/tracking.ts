export type TIPLocationResponse = {
    continent: string;
    country: string;
    regionName: string;
    city: string;
    lat: number;
    lon: number;
    timezone: string;
};

export type TDeviceInfo = {
    name?: string;
    model: string;
    platform: string;
    operatingSystem: string;
    osVersion: string;
    manufacturer: string;
};
